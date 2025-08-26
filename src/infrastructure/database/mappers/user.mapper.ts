/**
 * 🔄 User Mapper - Domain ↔ ORM
 *
 * Convertit entre l'entité Domain (pure) et l'entité ORM (infrastructure)
 * Pattern essentiel pour respecter la Clean Architecture
 * Support pour changement de BDD à la volée (SQL avec snake_case)
 */

import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserOrmEntity } from '../entities/typeorm/user.entity'; // TypeORM avec camelCase

export class UserMapper {
  /**
   * 📥 ORM Entity → Domain Entity (méthode d'instance)
   */
  toDomainEntity(ormEntity: UserOrmEntity): User {
    return UserMapper.toDomain(ormEntity);
  }

  /**
   * 📤 Domain Entity → ORM Entity (méthode d'instance)
   */
  toOrmEntity(domainEntity: User): UserOrmEntity {
    return UserMapper.toOrm(domainEntity);
  }

  /**
   * 📥 ORM Entity → Domain Entity (méthode statique)
   * Convertit depuis la base de données vers le domaine
   */
  static toDomain(ormEntity: UserOrmEntity): User {
    // Reconstruction de l'entité Domain avec toutes ses invariants
    const user = new User(
      new Email(ormEntity.email),
      ormEntity.name,
      ormEntity.role,
    );

    // Reconstitution des métadonnées via les propriétés privées
    (user as unknown as { id: string }).id = ormEntity.id;
    (user as unknown as { hashedPassword: string }).hashedPassword =
      ormEntity.hashedPassword;
    (user as unknown as { createdAt: Date }).createdAt = ormEntity.createdAt;
    (user as unknown as { updatedAt: Date }).updatedAt = ormEntity.updatedAt;

    // 🔐 Métadonnées de sécurité (préservation depuis la BDD)
    if (ormEntity.lastLoginAt) {
      (user as unknown as { _lastLoginAt: Date })._lastLoginAt =
        ormEntity.lastLoginAt;
    }
    if (ormEntity.lastLoginIp) {
      (user as unknown as { _lastLoginIp: string })._lastLoginIp =
        ormEntity.lastLoginIp;
    }
    if (ormEntity.loginAttempts !== undefined) {
      (user as unknown as { _loginAttempts: number })._loginAttempts =
        ormEntity.loginAttempts;
    }
    if (ormEntity.lockedUntil) {
      (user as unknown as { _lockedUntil: Date })._lockedUntil =
        ormEntity.lockedUntil;
    }
    if (ormEntity.emailVerified !== undefined) {
      (user as unknown as { _emailVerified: boolean })._emailVerified =
        ormEntity.emailVerified;
    }

    return user;
  }

  /**
   * 📤 Domain Entity → ORM Entity
   * Convertit depuis le domaine vers la base de données
   */
  static toOrm(domainEntity: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();

    ormEntity.id = domainEntity.id;
    ormEntity.email = domainEntity.email.value;
    ormEntity.name = domainEntity.name;
    ormEntity.hashedPassword =
      (domainEntity as unknown as { _password: string })._password || '';
    ormEntity.role = domainEntity.role;

    // Métadonnées de sécurité (avec accès privé)
    ormEntity.lastLoginAt = (
      domainEntity as unknown as { _lastLoginAt: Date }
    )._lastLoginAt;
    ormEntity.lastLoginIp = (
      domainEntity as unknown as { _lastLoginIp: string }
    )._lastLoginIp;
    ormEntity.loginAttempts =
      (domainEntity as unknown as { _loginAttempts: number })._loginAttempts ||
      0;
    ormEntity.lockedUntil = (
      domainEntity as unknown as { _lockedUntil: Date }
    )._lockedUntil;
    ormEntity.emailVerified =
      (domainEntity as unknown as { _emailVerified: boolean })._emailVerified ||
      false;

    // Status
    ormEntity.isActive = true; // Par défaut actif

    // Timestamps (préservés si existants)
    if ((domainEntity as unknown as { _createdAt: Date })._createdAt) {
      ormEntity.createdAt = (
        domainEntity as unknown as { _createdAt: Date }
      )._createdAt;
    }
    if ((domainEntity as unknown as { _updatedAt: Date })._updatedAt) {
      ormEntity.updatedAt = (
        domainEntity as unknown as { _updatedAt: Date }
      )._updatedAt;
    }

    return ormEntity;
  }

  /**
   * 🔄 Mise à jour d'une entité ORM avec les données Domain
   * Préserve les métadonnées ORM (version, created_at, etc.)
   */
  static updateOrm(
    ormEntity: UserOrmEntity,
    domainEntity: User,
  ): UserOrmEntity {
    // Mise à jour des champs modifiables
    ormEntity.email = domainEntity.email.value;
    ormEntity.name = domainEntity.name;
    ormEntity.role = domainEntity.role;

    // Mise à jour du mot de passe si changé
    const newPassword = (domainEntity as unknown as { _password: string })
      ._password;
    if (newPassword) {
      ormEntity.hashedPassword = newPassword;
    }

    // Métadonnées de sécurité
    ormEntity.lastLoginAt = (
      domainEntity as unknown as { _lastLoginAt: Date }
    )._lastLoginAt;
    ormEntity.lastLoginIp = (
      domainEntity as unknown as { _lastLoginIp: string }
    )._lastLoginIp;
    ormEntity.loginAttempts =
      (domainEntity as unknown as { _loginAttempts: number })._loginAttempts ||
      0;
    ormEntity.lockedUntil = (
      domainEntity as unknown as { _lockedUntil: Date }
    )._lockedUntil;
    ormEntity.emailVerified =
      (domainEntity as unknown as { _emailVerified: boolean })._emailVerified ||
      false;

    // updatedAt sera automatiquement mis à jour par TypeORM
    return ormEntity;
  }

  /**
   * 📊 Mapper des listes d'entités
   */
  static toDomainList(ormEntities: UserOrmEntity[]): User[] {
    return ormEntities.map((ormEntity) => this.toDomain(ormEntity));
  }

  static toOrmList(domainEntities: User[]): UserOrmEntity[] {
    return domainEntities.map((domainEntity) => this.toOrm(domainEntity));
  }
}
