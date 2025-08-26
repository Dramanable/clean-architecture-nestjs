/**
 * 🔄 User Mapper - Domain ↔ ORM
 *
 * Convertit entre l'entité Domain (pure) et l'entité ORM (infrastructure)
 * Pattern essentiel pour respecter la Clean Architecture
 */

import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserOrmEntity } from '../entities/typeorm/user.entity';

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
    // Utilisation de la factory method typée pour créer l'utilisateur avec toutes ses propriétés
    return User.createWithHashedPassword(
      ormEntity.id,
      new Email(ormEntity.email),
      ormEntity.name,
      ormEntity.role,
      ormEntity.hashedPassword,
      ormEntity.createdAt,
      ormEntity.updatedAt,
      ormEntity.passwordChangeRequired,
    );
  }

  /**
   * 📤 Domain Entity → ORM Entity
   * Convertit depuis le domaine vers la base de données
   */
  static toOrm(domainEntity: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();

    // Champs principaux
    ormEntity.id = domainEntity.id;
    ormEntity.email = domainEntity.email.value;
    ormEntity.name = domainEntity.name;
    ormEntity.role = domainEntity.role;
    ormEntity.hashedPassword = domainEntity.hashedPassword || '';

    // Métadonnées par défaut
    ormEntity.isActive = true;
    ormEntity.emailVerified = false;
    ormEntity.loginAttempts = 0;

    // Timestamps - gardés si ils existent
    if (domainEntity.createdAt) {
      ormEntity.createdAt = domainEntity.createdAt;
    }
    if (domainEntity.updatedAt) {
      ormEntity.updatedAt = domainEntity.updatedAt;
    }

    return ormEntity;
  }

  /**
   * 🔄 Mise à jour d'une entité ORM existante
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
    if (domainEntity.hashedPassword) {
      ormEntity.hashedPassword = domainEntity.hashedPassword;
    }

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
