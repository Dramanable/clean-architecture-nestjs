/**
 * 🍃 RefreshToken MongoDB Schema - @nestjs/mongoose
 *
 * Schéma MongoDB pour la persistance des refresh tokens
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({
  collection: 'refresh_tokens',
  timestamps: true,
  versionKey: '__version',
})
export class RefreshToken {
  @Prop({ required: true, type: String })
  _id: string;

  @Prop({ required: true, maxlength: 500 })
  tokenHash: string;

  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ maxlength: 100, default: null })
  deviceId?: string;

  @Prop({ maxlength: 500, default: null })
  userAgent?: string;

  @Prop({ maxlength: 45, default: null })
  ipAddress?: string;

  @Prop({ required: true, type: Date })
  expiresAt: Date;

  @Prop({ default: false })
  isRevoked: boolean;

  @Prop({ type: Date, default: null })
  revokedAt?: Date;

  @Prop({ maxlength: 100, default: null })
  revokedReason?: string;

  // 🏢 Multi-tenant
  @Prop({ maxlength: 100, default: null })
  tenantId?: string;

  // 📊 Métadonnées
  @Prop({ type: Object, default: null })
  metadata?: Record<string, any>;

  // 📅 Timestamps automatiques
  createdAt?: Date;
  updatedAt?: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// 📊 Index pour performance
RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ expiresAt: 1 });
RefreshTokenSchema.index({ isRevoked: 1 });
RefreshTokenSchema.index({ tokenHash: 1 }, { unique: true });

// 🔍 Index composites
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ tenantId: 1, userId: 1 });

// 🔄 TTL Index pour auto-suppression des tokens expirés
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
