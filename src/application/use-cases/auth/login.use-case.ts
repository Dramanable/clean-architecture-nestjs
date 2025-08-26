/**
 * 🔑 LoginUseCase - TDD GREEN Phase
 *
 * Use case pour l'authentification avec gestion d'erreurs spécifiques
 */

import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import {
  InvalidCredentialsError,
  TokenRepositoryError,
} from '../../exceptions/auth.exceptions';
import type { IConfigService } from '../../ports/config.port';
import type { I18nService } from '../../ports/i18n.port';
import type { Logger } from '../../ports/logger.port';

// Interfaces pour les ports
export interface UserRepository {
  findByEmail(email: string): Promise<any>;
}

export interface RefreshTokenRepository {
  save(refreshToken: any): Promise<any>;
  revokeAllByUserId(userId: string): Promise<void>;
}

export interface TokenService {
  generateAccessToken(
    userId: string,
    email: string,
    role: string,
    secret: string,
    expiresIn: number,
  ): string;
  generateRefreshToken(secret: string): string;
}

export interface PasswordService {
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

// DTOs
export interface LoginRequest {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKENS.JWT_TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(TOKENS.BCRYPT_PASSWORD_SERVICE)
    private readonly passwordService: PasswordService,
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
    @Inject(TOKENS.APP_CONFIG)
    private readonly config: IConfigService,
  ) {}

  async execute(request: LoginRequest): Promise<LoginResponse> {
    const operationContext = {
      operation: 'LOGIN',
      timestamp: new Date().toISOString(),
      email: request.email,
      userAgent: request.userAgent,
      ipAddress: request.ipAddress,
    };

    this.logger.info(this.i18n.t('operations.login.attempt'), operationContext);

    try {
      // 1. Rechercher l'utilisateur par email
      let user;
      try {
        user = await this.userRepository.findByEmail(request.email);
      } catch (error) {
        this.logger.error(
          this.i18n.t('errors.login.user_lookup_failed'),
          error as Error,
          operationContext,
        );
        throw new TokenRepositoryError(
          this.i18n.t('errors.login.user_lookup_failed'),
          { operation: 'findByEmail' },
        );
      }

      // 2. Vérifier si l'utilisateur existe
      if (!user) {
        this.logger.warn(this.i18n.t('warnings.login.user_not_found'), {
          ...operationContext,
          email: request.email,
        });
        throw new InvalidCredentialsError(
          this.i18n.t('errors.login.invalid_credentials'),
        );
      }

      // 3. Vérifier le mot de passe
      const isPasswordValid = await this.passwordService.compare(
        request.password,
        user.hashedPassword || '',
      );

      if (!isPasswordValid) {
        this.logger.warn(this.i18n.t('warnings.login.invalid_password'), {
          ...operationContext,
          userId: user.id,
        });
        throw new InvalidCredentialsError(
          this.i18n.t('errors.login.invalid_credentials'),
        );
      }

      // 4. Révoquer tous les anciens refresh tokens (sécurité)
      try {
        await this.refreshTokenRepository.revokeAllByUserId(user.id);
      } catch (error) {
        this.logger.warn(
          this.i18n.t('warnings.login.token_revocation_failed'),
          {
            ...operationContext,
            userId: user.id,
            error: (error as Error).message,
          },
        );
        // Continue malgré l'erreur de révocation
      }

      // 5. Générer de nouveaux tokens
      const accessTokenSecret = this.config.getAccessTokenSecret();
      const expiresIn = this.config.getAccessTokenExpirationTime();

      const accessToken = this.tokenService.generateAccessToken(
        user.id,
        user.email,
        user.role,
        accessTokenSecret,
        expiresIn,
      );

      const refreshTokenSecret = this.config.getRefreshTokenSecret();
      const refreshToken =
        this.tokenService.generateRefreshToken(refreshTokenSecret);

      // 6. Sauvegarder le nouveau refresh token
      try {
        await this.refreshTokenRepository.save({
          token: refreshToken,
          userId: user.id,
          userAgent: request.userAgent,
          ipAddress: request.ipAddress,
          expiresAt: new Date(
            Date.now() +
              this.config.getRefreshTokenExpirationDays() * 24 * 60 * 60 * 1000,
          ),
        });
      } catch (error) {
        this.logger.error(
          this.i18n.t('errors.login.token_save_failed'),
          error as Error,
          { ...operationContext, userId: user.id },
        );
        throw new TokenRepositoryError(
          this.i18n.t('errors.login.token_save_failed'),
          { operation: 'saveRefreshToken' },
        );
      }

      // 7. Logging de succès avec audit
      const successContext = {
        ...operationContext,
        result: 'success',
        userId: user.id,
      };

      this.logger.info(this.i18n.t('operations.login.success'), successContext);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      // Ne pas re-logger les erreurs déjà loggées spécifiquement
      if (
        error instanceof InvalidCredentialsError ||
        error instanceof TokenRepositoryError
      ) {
        throw error;
      }

      // Erreur inattendue
      this.logger.error(
        this.i18n.t('errors.login.unexpected_error'),
        error as Error,
        operationContext,
      );

      throw new TokenRepositoryError(
        this.i18n.t('errors.login.unexpected_error'),
        { originalError: (error as Error).message },
      );
    }
  }
}
