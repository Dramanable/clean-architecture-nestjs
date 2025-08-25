/**
 * 🔄 User Mapper MongoDB - Domain ↔ MongoDB
 *
 * Convertit entre l'entité Domain (pure) et le document MongoDB
 * Équivalent MongoDB du mapper SQL
 */

import { User as DomainUser } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserDocument } from '../entities/mongo/user.schema';

export class MongoUserMapper {
  /**
   * 📥 MongoDB Document → Domain Entity
   */
  static toDomain(mongoDoc: UserDocument): DomainUser {
    // Reconstruction de l'entité Domain avec validation
    const user = new DomainUser(
      new Email(mongoDoc.email),
      mongoDoc.name,
      mongoDoc.role,
    );

    // Reconstitution des propriétés privées
    (user as any).id = mongoDoc._id;
    (user as any)._password = mongoDoc.password;

    // Métadonnées de sécurité
    (user as any)._lastLoginAt = mongoDoc.lastLoginAt;
    (user as any)._lastLoginIp = mongoDoc.lastLoginIp;
    (user as any)._loginAttempts = mongoDoc.loginAttempts || 0;
    (user as any)._lockedUntil = mongoDoc.lockedUntil;
    (user as any)._emailVerified = mongoDoc.emailVerified || false;

    // Timestamps
    (user as any)._createdAt = mongoDoc.createdAt;
    (user as any)._updatedAt = mongoDoc.updatedAt;

    return user;
  }

  /**
   * 📤 Domain Entity → MongoDB Document Data
   */
  static toMongo(domainEntity: DomainUser): Partial<UserDocument> {
    return {
      _id: domainEntity.id,
      email: domainEntity.email.value, // Utilisation de .value pour Email VO
      name: domainEntity.name,
      password: (domainEntity as any)._password || '',
      role: domainEntity.role,
      isActive: true,

      // Métadonnées de sécurité
      lastLoginAt: (domainEntity as any)._lastLoginAt,
      lastLoginIp: (domainEntity as any)._lastLoginIp,
      loginAttempts: (domainEntity as any)._loginAttempts || 0,
      lockedUntil: (domainEntity as any)._lockedUntil,
      emailVerified: (domainEntity as any)._emailVerified || false,
      emailVerifiedAt: (domainEntity as any)._emailVerifiedAt,

      // Multi-tenant (optionnel)
      tenantId: (domainEntity as any)._tenantId,

      // Métadonnées
      metadata: (domainEntity as any)._metadata,
    };
  }

  /**
   * 🔄 Mise à jour d'un document MongoDB
   */
  static updateMongo(
    mongoDoc: UserDocument,
    domainEntity: DomainUser,
  ): UserDocument {
    // Mise à jour des champs modifiables
    mongoDoc.email = domainEntity.email.value;
    mongoDoc.name = domainEntity.name;
    mongoDoc.role = domainEntity.role;

    // Mise à jour du mot de passe si changé
    const newPassword = (domainEntity as any)._password;
    if (newPassword) {
      mongoDoc.password = newPassword;
    }

    // Métadonnées de sécurité
    mongoDoc.lastLoginAt = (domainEntity as any)._lastLoginAt;
    mongoDoc.lastLoginIp = (domainEntity as any)._lastLoginIp;
    mongoDoc.loginAttempts = (domainEntity as any)._loginAttempts || 0;
    mongoDoc.lockedUntil = (domainEntity as any)._lockedUntil;
    mongoDoc.emailVerified = (domainEntity as any)._emailVerified || false;

    // updatedAt sera automatiquement mis à jour par Mongoose
    return mongoDoc;
  }

  /**
   * 📊 Mapper des listes
   */
  static toDomainList(mongoDocs: UserDocument[]): DomainUser[] {
    return mongoDocs.map((doc) => this.toDomain(doc));
  }

  static toMongoList(domainEntities: DomainUser[]): Partial<UserDocument>[] {
    return domainEntities.map((entity) => this.toMongo(entity));
  }
}
