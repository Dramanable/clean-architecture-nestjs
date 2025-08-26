/**
 * 🍃 User MongoDB Schema - @nestjs/mongoose
 *
 * Schéma MongoDB pour la persistance des utilisateurs avec NestJS Mongoose
 * Équivalent NoSQL de l'entité SQL avec decorators NestJS
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../../../shared/enums/user-role.enum';

export type UserDocument = User & Document;

@Schema({
  collection: 'users',
  timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  versionKey: '__version', // Pour l'optimistic locking
})
export class User {
  @Prop({ required: true, type: String })
  _id!: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 255,
  })
  email!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  name!: string;

  @Prop({
    required: true,
    maxlength: 255,
  })
  password!: string;

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  })
  role!: UserRole;

  @Prop({ default: true })
  isActive!: boolean;

  // 🔐 Sécurité
  @Prop({ type: Date, default: null })
  lastLoginAt?: Date;

  @Prop({ maxlength: 45, default: null })
  lastLoginIp?: string;

  @Prop({ default: 0 })
  loginAttempts!: number;

  @Prop({ type: Date, default: null })
  lockedUntil?: Date;

  // 📧 Email verification
  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop({ type: Date, default: null })
  emailVerifiedAt?: Date;

  // 🏢 Multi-tenant
  @Prop({ maxlength: 100, default: null })
  tenantId?: string;

  // 📊 Métadonnées flexibles (Schema.Types.Mixed équivalent)
  @Prop({ type: Object, default: null })
  metadata?: Record<string, any>;

  // 📅 Timestamps (automatiques avec timestamps: true)
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 📊 Index pour performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ tenantId: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLoginAt: -1 });

// 🔍 Index composites
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ isActive: 1, tenantId: 1 });

// 🛡️ Sécurité : Ne jamais retourner le mot de passe
UserSchema.methods.toJSON = function (): unknown {
  const obj = this.toObject() as Record<string, unknown>;
  delete (obj as { password?: unknown }).password;
  return obj;
};
