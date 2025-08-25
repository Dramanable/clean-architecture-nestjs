/**
 * 🏭 DATABASE MAPPER FACTORY
 *
 * Factory pour créer les mappers selon le type de base de données
 * Permet le changement de BDD à la volée sans violer Clean Architecture
 */

import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';

// Types pour les entités TypeORM
import { UserOrmEntity } from '../entities/typeorm/user.entity';

// Mappers spécialisés
import { UserMapper as TypeOrmUserMapper } from './typeorm-user.mapper';

export type DatabaseType = 'postgresql' | 'mysql' | 'sqlite' | 'typeorm';

/**
 * 🔄 Interface commune pour tous les mappers
 */
export interface IUserMapper<TEntity = UserOrmEntity> {
  toDomainEntity(ormEntity: TEntity): User;
  toOrmEntity(domainEntity: User): TEntity;
  toDomainList(ormEntities: TEntity[]): User[];
  toOrmList(domainEntities: User[]): TEntity[];
  updateOrm(ormEntity: TEntity, domainEntity: User): TEntity;
}

/**
 * 🏭 Factory pour créer le bon mapper selon la BDD
 */
@Injectable()
export class DatabaseMapperFactory {
  /**
   * 🎯 Crée le mapper approprié selon le type de BDD
   */
  createUserMapper(databaseType: DatabaseType): IUserMapper {
    // Pour l'instant, on supporte seulement TypeORM (PostgreSQL, MySQL, SQLite via TypeORM)
    return new TypeOrmUserMapperAdapter();
  }
}

/**
 * 🔧 Adapter pour mapper TypeORM (camelCase)
 */
class TypeOrmUserMapperAdapter implements IUserMapper<UserOrmEntity> {
  toDomainEntity(ormEntity: UserOrmEntity): User {
    return TypeOrmUserMapper.toDomain(ormEntity);
  }

  toOrmEntity(domainEntity: User): UserOrmEntity {
    return TypeOrmUserMapper.toOrm(domainEntity);
  }

  toDomainList(ormEntities: UserOrmEntity[]): User[] {
    return TypeOrmUserMapper.toDomainList(ormEntities);
  }

  toOrmList(domainEntities: User[]): UserOrmEntity[] {
    return TypeOrmUserMapper.toOrmList(domainEntities);
  }

  updateOrm(ormEntity: UserOrmEntity, domainEntity: User): UserOrmEntity {
    return TypeOrmUserMapper.updateOrm(ormEntity, domainEntity);
  }
}

/**
 * 🎯 Service d'injection pour les repositories
 *
 * Exemple d'utilisation dans un repository :
 *
 * ```typescript
 * @Injectable()
 * export class UserRepository {
 *   private mapper: IUserMapper;
 *
 *   constructor(
 *     private mapperFactory: DatabaseMapperFactory,
 *     @Inject('DATABASE_TYPE') private dbType: DatabaseType
 *   ) {
 *     this.mapper = this.mapperFactory.createUserMapper(this.dbType);
 *   }
 * }
 * ```
 */
export class MapperService {
  private userMapper: IUserMapper;

  constructor(
    private readonly mapperFactory: DatabaseMapperFactory,
    private readonly databaseType: DatabaseType,
  ) {
    this.userMapper = this.mapperFactory.createUserMapper(this.databaseType);
  }

  getUserMapper(): IUserMapper {
    return this.userMapper;
  }

  /**
   * 🔄 Permet de changer de BDD à la volée
   */
  switchDatabase(newDatabaseType: DatabaseType): void {
    this.userMapper = this.mapperFactory.createUserMapper(newDatabaseType);
  }
}
