/**
 * 🎯 Login Use Case
 *
 * Règles métier pour l'authentification avec génération de tokens JWT et refresh
 */

import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { InvalidCredentialsError } from '../../../domain/exceptions/user.exceptions';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { IConfigService } from '../../ports/config.port';
import type { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';

// Interfaces pour les ports
export interface PasswordService {
  verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export interface TokenService {
  generateAccessToken(
    userId: string,
    email: string,
    role: string,
    secret: string,
    expiresIn: number,
    algorithm?: string,
  ): string;
  generateRefreshToken(secret: string, algorithm?: string): string;
}

export interface RefreshTokenRepository {
  save(refreshToken: RefreshToken): Promise<RefreshToken>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  revokeAllByUserId(userId: string): Promise<void>;
}

// DTOs
export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  expiresIn: number; // Durée en secondes
  tokenType: 'Bearer';
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly config: IConfigService,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const startTime = Date.now();
    const requestContext = {
      operation: 'Login',
      email: request.email,
      deviceId: request.deviceId,
      ipAddress: request.ipAddress,
    };

    this.logger.info(
      this.i18n.t('operations.auth.login_attempt', {
        email: request.email,
      }),
      requestContext,
    );

    try {
      // 1. Validation et récupération de l'utilisateur
      this.logger.debug(
        this.i18n.t('operations.user.validation_process'),
        requestContext,
      );

      const email = new Email(request.email.trim());
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        this.logger.warn(this.i18n.t('warnings.auth.invalid_credentials'), {
          ...requestContext,
          reason: 'user_not_found',
        });
        throw new InvalidCredentialsError();
      }

      // 2. Vérification du mot de passe
      this.logger.debug(
        this.i18n.t('operations.auth.password_verification'),
        requestContext,
      );

      const isValidPassword = await this.passwordService.verify(
        request.password,
        user.hashedPassword || 'dummy-hash', // Protection contre timing attacks
      );

      if (!isValidPassword) {
        this.logger.warn(this.i18n.t('warnings.auth.invalid_credentials'), {
          ...requestContext,
          reason: 'invalid_password',
        });
        throw new InvalidCredentialsError();
      }

      // 3. Révocation des anciens refresh tokens (optionnel - sécurité max)
      await this.revokeExistingTokens(user.id, requestContext);

      // 4. Génération des nouveaux tokens
      this.logger.debug(
        this.i18n.t('operations.auth.token_generation'),
        requestContext,
      );

      const accessToken = this.tokenService.generateAccessToken(
        user.id,
        user.email.value,
        user.role,
        this.config.getAccessTokenSecret(),
        this.config.getAccessTokenExpirationTime(),
        this.config.getAccessTokenAlgorithm(),
      );

      const refreshTokenValue = this.tokenService.generateRefreshToken(
        this.config.getRefreshTokenSecret(),
        this.config.getRefreshTokenAlgorithm(),
      );

      // 5. Création et sauvegarde du refresh token
      const expiresAt = new Date();
      const refreshTokenExpirationDays =
        this.config.getRefreshTokenExpirationDays();
      expiresAt.setDate(expiresAt.getDate() + refreshTokenExpirationDays);

      const refreshToken = new RefreshToken(
        user.id,
        refreshTokenValue,
        expiresAt,
        request.deviceId,
        request.userAgent,
        request.ipAddress,
      );

      await this.refreshTokenRepository.save(refreshToken);

      const duration = Date.now() - startTime;

      // Log de succès
      this.logger.info(
        this.i18n.t('success.auth.login_success', {
          email: user.email.value,
          userId: user.id,
        }),
        { ...requestContext, duration },
      );

      // Audit trail
      this.logger.audit(this.i18n.t('audit.auth.user_logged_in'), user.id, {
        email: user.email.value,
        deviceId: request.deviceId,
        ipAddress: request.ipAddress,
        userAgent: request.userAgent,
      });

      // 6. Retour de la réponse
      return {
        accessToken,
        refreshToken: refreshTokenValue,
        user: {
          id: user.id,
          email: user.email.value,
          name: user.name,
          role: user.role,
        },
        expiresIn: this.config.getAccessTokenExpirationTime(),
        tokenType: 'Bearer',
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Ne pas logger les erreurs de credentials (sécurité)
      if (!(error instanceof InvalidCredentialsError)) {
        this.logger.error(
          this.i18n.t('operations.failed', { operation: 'Login' }),
          error as Error,
          { ...requestContext, duration },
        );
      }

      throw error;
    }
  }

  /**
   * Révoque tous les refresh tokens existants pour l'utilisateur
   */
  private async revokeExistingTokens(
    userId: string,
    requestContext: Record<string, unknown>,
  ): Promise<void> {
    try {
      this.logger.debug(
        this.i18n.t('operations.auth.token_revocation'),
        requestContext,
      );

      await this.refreshTokenRepository.revokeAllByUserId(userId);
    } catch (error) {
      // Log mais ne fait pas échouer le login
      this.logger.warn(this.i18n.t('warnings.auth.token_revocation_failed'), {
        ...requestContext,
        error: (error as Error).message,
      });
    }
  }
}
