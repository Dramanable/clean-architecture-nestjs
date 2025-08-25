/**
 * 🔄 RefreshTokenUseCase - TDD GREEN Phase
 *
 * Use case pour le renouvellement des tokens d'accès
 */

import { Injectable, Inject } from '@nestjs/common';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import type { Logger } from '../../ports/logger.port';
import type { I18nService } from '../../ports/i18n.port';
import type { IConfigService } from '../../ports/config.port';
import {
  InvalidRefreshTokenError,
  TokenExpiredError,
  UserNotFoundError,
  TokenRepositoryError,
} from '../../exceptions/auth.exceptions';

// Interfaces pour les ports
export interface RefreshTokenRepository {
  findByToken(token: string): Promise<any>;
  save(refreshToken: any): Promise<any>;
  revokeAllByUserId(userId: string): Promise<void>;
}

export interface UserRepository {
  findById(id: string): Promise<any>;
}

export interface TokenService {
  generateAccessToken(
    userId: string, 
    email: string, 
    role: string,
    secret: string,
    expiresIn: number,
    algorithm?: string
  ): string;
  generateRefreshToken(
    secret: string,
    algorithm?: string
  ): string;
}

// DTOs
export interface RefreshTokenRequest {
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  expiresIn: number;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(TOKENS.REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.TOKEN_SERVICE)
    private readonly tokenService: TokenService,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
    @Inject(TOKENS.CONFIG_SERVICE)
    private readonly config: IConfigService,
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const operationContext = {
      operation: 'REFRESH_TOKEN',
      timestamp: new Date().toISOString(),
    };

    this.logger.info(
      this.i18n.t('operations.refresh_token.attempt'),
      operationContext,
    );

    try {
      // 1. Valider le refresh token
      let storedToken;
      try {
        storedToken = await this.refreshTokenRepository.findByToken(request.refreshToken);
      } catch (error) {
        this.logger.error(
          this.i18n.t('errors.refresh_token.repository_lookup_failed'),
          error as Error,
          operationContext,
        );
        throw new TokenRepositoryError(
          this.i18n.t('errors.refresh_token.repository_lookup_failed'),
          { operation: 'findByToken' },
        );
      }

      if (!storedToken) {
        this.logger.warn(
          this.i18n.t('warnings.refresh_token.token_not_found'),
          { ...operationContext, tokenProvided: !!request.refreshToken },
        );
        throw new InvalidRefreshTokenError(
          this.i18n.t('errors.refresh_token.invalid_token'),
        );
      }

      if (!storedToken.isValid || !storedToken.isValid()) {
        this.logger.warn(
          this.i18n.t('warnings.refresh_token.token_invalid'),
          { ...operationContext, userId: storedToken.userId },
        );
        throw new InvalidRefreshTokenError(
          this.i18n.t('errors.refresh_token.invalid_token'),
        );
      }

      if (storedToken.isExpired && storedToken.isExpired()) {
        this.logger.warn(
          this.i18n.t('warnings.refresh_token.token_expired'),
          { ...operationContext, userId: storedToken.userId },
        );
        throw new TokenExpiredError(
          this.i18n.t('errors.refresh_token.token_expired'),
        );
      }

      // 2. Récupérer l'utilisateur
      let user;
      try {
        user = await this.userRepository.findById(storedToken.userId);
      } catch (error) {
        this.logger.error(
          this.i18n.t('errors.refresh_token.user_lookup_failed'),
          error as Error,
          { ...operationContext, userId: storedToken.userId },
        );
        throw new TokenRepositoryError(
          this.i18n.t('errors.refresh_token.user_lookup_failed'),
          { userId: storedToken.userId },
        );
      }

      if (!user) {
        this.logger.error(
          this.i18n.t('errors.refresh_token.user_not_found'),
          new Error('User not found'),
          { ...operationContext, userId: storedToken.userId },
        );
        throw new UserNotFoundError(
          this.i18n.t('errors.refresh_token.user_not_found'),
          { userId: storedToken.userId },
        );
      }

      // 3. Révoquer l'ancien refresh token (rotation de sécurité)
      try {
        if (storedToken.revoke) {
          storedToken.revoke();
        }
      } catch (error) {
        this.logger.warn(
          this.i18n.t('warnings.refresh_token.revoke_failed'),
          { ...operationContext, error: (error as Error).message },
        );
        // Continue malgré l'erreur de révocation
      }

      // 4. Générer de nouveaux tokens
      const accessTokenSecret = this.config.getAccessTokenSecret();
      const expiresIn = this.config.getAccessTokenExpirationTime();
      
      const newAccessToken = this.tokenService.generateAccessToken(
        user.id,
        user.email,
        user.role,
        accessTokenSecret,
        expiresIn,
      );

      const refreshTokenSecret = this.config.getRefreshTokenSecret();
      const newRefreshToken = this.tokenService.generateRefreshToken(refreshTokenSecret);

      // 5. Sauvegarder le nouveau refresh token
      try {
        await this.refreshTokenRepository.save({
          token: newRefreshToken,
          userId: user.id,
          userAgent: request.userAgent,
          ipAddress: request.ipAddress,
          expiresAt: new Date(Date.now() + this.config.getRefreshTokenExpirationDays() * 24 * 60 * 60 * 1000),
        });
      } catch (error) {
        this.logger.error(
          this.i18n.t('errors.refresh_token.save_failed'),
          error as Error,
          { ...operationContext, userId: user.id },
        );
        throw new TokenRepositoryError(
          this.i18n.t('errors.refresh_token.save_failed'),
          { userId: user.id, operation: 'save' },
        );
      }

      this.logger.info(
        this.i18n.t('operations.refresh_token.success'),
        { ...operationContext, userId: user.id },
      );

      return {
        success: true,
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        expiresIn,
      };
    } catch (error) {
      // Les erreurs spécifiques sont re-lancées telles quelles
      if (error instanceof InvalidRefreshTokenError || 
          error instanceof TokenExpiredError || 
          error instanceof UserNotFoundError || 
          error instanceof TokenRepositoryError) {
        throw error;
      }

      // Erreur inattendue
      this.logger.error(
        this.i18n.t('errors.refresh_token.unexpected_error'),
        error as Error,
        operationContext,
      );
      
      throw new TokenRepositoryError(
        this.i18n.t('errors.refresh_token.unexpected_error'),
        { originalError: (error as Error).message },
      );
    }
  }
}
