/**
 * 🚪 LogoutUseCase - TDD GREEN Phase
 *
 * Use case pour la déconnexion avec gestion d'erreurs spécifiques
 */

import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import { TokenRepositoryError } from '../../exceptions/auth.exceptions';
import type { I18nService } from '../../ports/i18n.port';
import type { Logger } from '../../ports/logger.port';
import type { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';

// DTOs
export interface LogoutRequest {
  refreshToken: string;
  logoutAll?: boolean;
  userAgent?: string;
  ipAddress?: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(TOKENS.REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {}

  async execute(request: LogoutRequest): Promise<LogoutResponse> {
    const operationContext = {
      operation: 'LOGOUT',
      logoutAll: request.logoutAll || false,
      timestamp: new Date().toISOString(),
    };

    this.logger.info(
      this.i18n.t('operations.logout.attempt'),
      operationContext,
    );

    try {
      // 1. Rechercher le token pour obtenir l'userId
      let userId: string | null = null;

      try {
        const storedToken = await this.refreshTokenRepository.findByToken(
          request.refreshToken,
        );

        if (storedToken && storedToken.isValid && storedToken.isValid()) {
          userId = storedToken.userId;
        }
      } catch (error) {
        // Log l'erreur mais continue le processus (sécurité)
        this.logger.warn(this.i18n.t('operations.logout.token_lookup_failed'), {
          ...operationContext,
          error: (error as Error).message,
        });
      }

      // 2. Déconnexion selon le mode demandé
      if (request.logoutAll && userId) {
        try {
          await this.refreshTokenRepository.revokeAllByUserId(userId);

          this.logger.info(
            this.i18n.t('operations.logout.all_devices_success'),
            { ...operationContext, userId, devicesLoggedOut: 'all' },
          );
        } catch (error) {
          this.logger.error(
            this.i18n.t('errors.logout.revoke_all_failed'),
            error as Error,
            { ...operationContext, userId },
          );

          throw new TokenRepositoryError(
            this.i18n.t('errors.logout.revoke_all_failed'),
            { userId, operation: 'revokeAll' },
          );
        }
      } else {
        // Déconnexion du device actuel seulement
        try {
          await this.refreshTokenRepository.revokeByToken(request.refreshToken);

          this.logger.info(
            this.i18n.t('operations.logout.single_device_success'),
            { ...operationContext, userId: userId || 'unknown' },
          );
        } catch (error) {
          // Même si la révocation échoue, on considère le logout comme réussi (sécurité)
          this.logger.warn(this.i18n.t('warnings.logout.revoke_token_failed'), {
            ...operationContext,
            error: (error as Error).message,
          });
        }
      }

      // 3. Succès dans tous les cas (pour la sécurité)
      const successMessage = request.logoutAll
        ? this.i18n.t('success.logout.all_devices')
        : this.i18n.t('success.logout.current_device');

      this.logger.info(this.i18n.t('operations.logout.completed'), {
        ...operationContext,
        userId: userId || 'unknown',
        result: 'success',
      });

      return {
        success: true,
        message: successMessage,
      };
    } catch (error) {
      // Gestion des erreurs spécifiques
      if (error instanceof TokenRepositoryError) {
        this.logger.error(
          this.i18n.t('errors.logout.repository_error'),
          error,
          operationContext,
        );
        throw error;
      }

      // Erreur inattendue - log mais retourne succès pour sécurité
      this.logger.error(
        this.i18n.t('errors.logout.unexpected_error'),
        error as Error,
        operationContext,
      );

      // Pour la sécurité, on retourne toujours un succès
      return {
        success: true,
        message: this.i18n.t('success.logout.completed'),
      };
    }
  }
}
