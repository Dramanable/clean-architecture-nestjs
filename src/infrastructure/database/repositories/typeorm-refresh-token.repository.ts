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
import { RefreshToken as DomainRefreshToken } from '../../../domain/entities/refresh-token.entity';
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

  async findByToken(token: string): Promise<DomainRefreshToken | null> {
    const context = {
      operation: 'FIND_REFRESH_TOKEN',
      timestamp: new Date().toISOString(),
    };

    this.logger.info(this.i18n.t('operations.refresh_token.lookup_attempt'), {
      ...context,
      tokenProvided: !!token,
    });

    try {
      // Hash le token avant de le chercher en base
      const hashedToken = this.hashToken(token);

      const result = await this.repository.findOne({
        where: { tokenHash: hashedToken },
      });

      if (result) {
        this.logger.info(
          this.i18n.t('operations.refresh_token.lookup_success'),
          { ...context, tokenId: result.id, userId: result.userId },
        );

        // Convertir l'entité ORM en entité domain
        const domainToken = DomainRefreshToken.reconstruct(
          result.id,
          result.userId,
          result.tokenHash,
          result.expiresAt,
          {
            deviceId: result.deviceId,
            userAgent: result.userAgent,
            ipAddress: result.ipAddress,
          },
          result.isRevoked,
          result.revokedAt,
          result.createdAt,
        );

        // Vérifier que le token fourni correspond au hash stocké
        if (!domainToken.verifyToken(token)) {
          this.logger.warn('Token hash mismatch - possible security issue', {
            ...context,
            tokenId: result.id,
            userId: result.userId,
          });
          return null;
        }

        return domainToken;
      } else {
        this.logger.warn(
          this.i18n.t('warnings.refresh_token.token_not_found'),
          { ...context, tokenProvided: !!token },
        );
        return null;
      }
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.refresh_token.lookup_failed'),
        error as Error,
        context,
      );
      throw error;
    }
  }

  async save(domainToken: DomainRefreshToken): Promise<RefreshTokenOrmEntity> {
    const context = {
      operation: 'SAVE_REFRESH_TOKEN',
      timestamp: new Date().toISOString(),
      userId: domainToken.userId,
    };

    this.logger.info(
      this.i18n.t('operations.refresh_token.save_attempt'),
      context,
    );

    try {
      const entity = new RefreshTokenOrmEntity();
      entity.tokenHash = domainToken.tokenHash;
      entity.userId = domainToken.userId;
      entity.userAgent = domainToken.userAgent;
      entity.ipAddress = domainToken.ipAddress;
      entity.expiresAt = domainToken.expiresAt;
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

  /**
   * Hash le token pour la recherche en base de données
   * Même logique que dans l'entité domain RefreshToken
   */
  private hashToken(token: string): string {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }
}
