/**
 * 🔑 TypeOrmRefreshTokenRepository - TDD GREEN Phase
 *
 * Implémentation TypeORM pour la gestion des refresh tokens
 */

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import { RefreshTokenOrmEntity } from '../entities/typeorm/refresh-token.entity';

@Injectable()
export class TypeOrmRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repository: Repository<RefreshTokenOrmEntity>,
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {}

  async findByToken(token: string): Promise<RefreshTokenOrmEntity | null> {
    const context = {
      operation: 'FIND_REFRESH_TOKEN',
      timestamp: new Date().toISOString(),
    };

    this.logger.info(this.i18n.t('operations.refresh_token.lookup_attempt'), {
      ...context,
      tokenProvided: !!token,
    });

    try {
      const result = await this.repository.findOne({
        where: { tokenHash: token },
      });

      if (result) {
        this.logger.info(
          this.i18n.t('operations.refresh_token.lookup_success'),
          { ...context, tokenId: result.id, userId: result.userId },
        );
      } else {
        this.logger.warn(
          this.i18n.t('warnings.refresh_token.token_not_found'),
          { ...context, tokenProvided: !!token },
        );
      }

      return result;
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.refresh_token.lookup_failed'),
        error as Error,
        context,
      );
      throw error;
    }
  }

  async save(refreshTokenData: {
    token: string;
    userId: string;
    userAgent?: string;
    ipAddress?: string;
    expiresAt: Date;
  }): Promise<RefreshTokenOrmEntity> {
    const context = {
      operation: 'SAVE_REFRESH_TOKEN',
      timestamp: new Date().toISOString(),
      userId: refreshTokenData.userId,
    };

    this.logger.info(
      this.i18n.t('operations.refresh_token.save_attempt'),
      context,
    );

    try {
      const entity = new RefreshTokenOrmEntity();
      entity.tokenHash = refreshTokenData.token;
      entity.userId = refreshTokenData.userId;
      entity.userAgent = refreshTokenData.userAgent;
      entity.ipAddress = refreshTokenData.ipAddress;
      entity.expiresAt = refreshTokenData.expiresAt;
      entity.isRevoked = false;

      const result = await this.repository.save(entity);

      this.logger.info(this.i18n.t('operations.refresh_token.save_success'), {
        ...context,
        tokenId: result.id,
      });

      return result;
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.refresh_token.save_failed'),
        error as Error,
        context,
      );
      throw error;
    }
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    const context = {
      operation: 'REVOKE_ALL_REFRESH_TOKENS',
      timestamp: new Date().toISOString(),
      userId,
    };

    this.logger.info(
      this.i18n.t('operations.refresh_token.revoke_all_attempt'),
      context,
    );

    try {
      const result = await this.repository.update(
        { userId, isRevoked: false },
        { isRevoked: true, revokedAt: new Date() },
      );

      this.logger.info(
        this.i18n.t('operations.refresh_token.revoke_all_success'),
        { ...context, tokensRevoked: result.affected || 0 },
      );
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.refresh_token.revoke_all_failed'),
        error as Error,
        context,
      );
      throw error;
    }
  }
}
