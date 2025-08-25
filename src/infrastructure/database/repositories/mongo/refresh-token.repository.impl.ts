/**
 * 🍃 MongoDB RefreshToken Repository Implementation
 *
 * Implémentation MongoDB pour la gestion des tokens de rafraîchissement
 */

import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { I18nService } from '../../../../application/ports/i18n.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { RefreshToken as DomainRefreshToken } from '../../../../domain/entities/refresh-token.entity';
import { TOKENS } from '../../../../shared/constants/injection-tokens';
import {
    RefreshToken,
    RefreshTokenDocument,
} from '../../entities/mongo/refresh-token.schema';

export interface IRefreshTokenRepository {
  save(token: DomainRefreshToken): Promise<DomainRefreshToken>;
  findByToken(token: string): Promise<DomainRefreshToken | null>;
  findByUserId(userId: string): Promise<DomainRefreshToken[]>;
  deleteByUserId(userId: string): Promise<void>;
  deleteExpiredTokens(): Promise<number>;
}

@Injectable()
export class MongoRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly tokenModel: Model<RefreshTokenDocument>,
    @Inject(TOKENS.LOGGER) private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE) private readonly i18n: I18nService,
  ) {}

  async save(token: DomainRefreshToken): Promise<DomainRefreshToken> {
    try {
      this.logger.info(this.i18n.t('operations.refresh_token.save_attempt'), {
        tokenId: token.id,
        userId: token.userId,
      });

      const tokenDoc = this.domainToMongo(token);

      const savedToken = await this.tokenModel.findOneAndUpdate(
        { _id: token.id },
        tokenDoc,
        { upsert: true, new: true },
      );

      this.logger.info(
        this.i18n.t('operations.refresh_token.saved_successfully'),
        { tokenId: savedToken._id },
      );

      return this.mongoToDomain(savedToken);
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.refresh_token.save_failed'),
        error,
        { tokenId: token.id },
      );
      throw error;
    }
  }

  async findByToken(hashedToken: string): Promise<DomainRefreshToken | null> {
    try {
      const token = await this.tokenModel.findOne({
        hashedToken,
        expiresAt: { $gt: new Date() },
        isRevoked: false,
      });

      return token ? this.mongoToDomain(token) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.refresh_token.find_failed'),
        error,
      );
      return null;
    }
  }

  async findByUserId(userId: string): Promise<DomainRefreshToken[]> {
    try {
      const tokens = await this.tokenModel
        .find({
          userId,
          expiresAt: { $gt: new Date() },
          isRevoked: false,
        })
        .sort({ createdAt: -1 });

      return tokens.map((token) => this.mongoToDomain(token));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.refresh_token.find_by_user_failed'),
        error,
        { userId },
      );
      return [];
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    try {
      await this.tokenModel.updateMany(
        { userId },
        { isRevoked: true, revokedAt: new Date() },
      );

      this.logger.info(
        this.i18n.t('operations.refresh_token.user_tokens_revoked'),
        { userId },
      );
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.refresh_token.revoke_failed'),
        error,
        { userId },
      );
      throw error;
    }
  }

  async deleteExpiredTokens(): Promise<number> {
    try {
      const result = await this.tokenModel.deleteMany({
        $or: [{ expiresAt: { $lt: new Date() } }, { isRevoked: true }],
      });

      this.logger.info(
        this.i18n.t('operations.refresh_token.cleanup_completed'),
        { deletedCount: result.deletedCount },
      );

      return result.deletedCount || 0;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.refresh_token.cleanup_failed'),
        error,
      );
      return 0;
    }
  }

  /**
   * 🔄 Conversion Domain → MongoDB
   */
  private domainToMongo(
    token: DomainRefreshToken,
  ): Partial<RefreshTokenDocument> {
    return {
      _id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      deviceId: token.deviceId,
      userAgent: token.userAgent,
      ipAddress: token.ipAddress,
      expiresAt: token.expiresAt,
      isRevoked: token.isRevoked,
      revokedAt: token.revokedAt,
    };
  }

  /**
   * 🔄 Conversion MongoDB → Domain
   */
  private mongoToDomain(tokenDoc: RefreshTokenDocument): DomainRefreshToken {
    return DomainRefreshToken.reconstruct(
      tokenDoc._id,
      tokenDoc.userId,
      tokenDoc.tokenHash,
      tokenDoc.expiresAt,
      {
        deviceId: tokenDoc.deviceId,
        userAgent: tokenDoc.userAgent,
        ipAddress: tokenDoc.ipAddress,
      },
      tokenDoc.isRevoked,
      tokenDoc.revokedAt,
      tokenDoc.createdAt,
      tokenDoc.updatedAt,
    );
  }
}
