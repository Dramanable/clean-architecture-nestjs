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
    (user as unknown as { id: string }).id = mongoDoc._id;
    (user as unknown as { _password: string })._password =
      mongoDoc.hashedPassword;

    // Métadonnées de sécurité
    (user as unknown as { _lastLoginAt: Date | null })._lastLoginAt =
      mongoDoc.lastLoginAt || null;
    (user as unknown as { _lastLoginIp: string | null })._lastLoginIp =
      mongoDoc.lastLoginIp || null;
    (user as unknown as { _loginAttempts: number })._loginAttempts =
      mongoDoc.loginAttempts || 0;
    (user as unknown as { _lockedUntil: Date | null })._lockedUntil =
      mongoDoc.lockedUntil || null;
    (user as unknown as { _emailVerified: boolean })._emailVerified =
      mongoDoc.emailVerified || false;

    // Timestamps
    (user as unknown as { _createdAt: Date })._createdAt =
      mongoDoc.createdAt || new Date();
    (user as unknown as { _updatedAt: Date })._updatedAt =
      mongoDoc.updatedAt || new Date();

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
      hashedPassword:
        (domainEntity as unknown as { _password: string })._password || '',
      role: domainEntity.role,
      isActive: true,

      // Métadonnées de sécurité
      lastLoginAt:
        (domainEntity as unknown as { _lastLoginAt: Date | null })
          ._lastLoginAt || undefined,
      lastLoginIp:
        (domainEntity as unknown as { _lastLoginIp: string | null })
          ._lastLoginIp || undefined,
      loginAttempts:
        (domainEntity as unknown as { _loginAttempts: number })
          ._loginAttempts || 0,
      lockedUntil:
        (domainEntity as unknown as { _lockedUntil: Date | null })
          ._lockedUntil || undefined,
      emailVerified:
        (domainEntity as unknown as { _emailVerified: boolean })
          ._emailVerified || false,
      emailVerifiedAt:
        (domainEntity as unknown as { _emailVerifiedAt: Date | null })
          ._emailVerifiedAt || undefined,

      // Multi-tenant (optionnel)
      tenantId:
        (domainEntity as unknown as { _tenantId: string | null })._tenantId ||
        undefined,

      // Métadonnées
      metadata: (
        domainEntity as unknown as { _metadata: Record<string, unknown> }
      )._metadata,
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
    const newPassword = (domainEntity as unknown as { _password: string })
      ._password;
    if (newPassword) {
      mongoDoc.hashedPassword = newPassword;
    }

    // Métadonnées de sécurité
    mongoDoc.lastLoginAt =
      (domainEntity as unknown as { _lastLoginAt: Date | null })._lastLoginAt ||
      undefined;
    mongoDoc.lastLoginIp =
      (domainEntity as unknown as { _lastLoginIp: string | null })
        ._lastLoginIp || undefined;
    mongoDoc.loginAttempts =
      (domainEntity as unknown as { _loginAttempts: number })._loginAttempts ||
      0;
    mongoDoc.lockedUntil =
      (domainEntity as unknown as { _lockedUntil: Date | null })._lockedUntil ||
      undefined;
    mongoDoc.emailVerified =
      (domainEntity as unknown as { _emailVerified: boolean })._emailVerified ||
      false;

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
