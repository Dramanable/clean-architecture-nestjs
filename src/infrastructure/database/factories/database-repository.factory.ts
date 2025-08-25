/**
 * 🏭 Database Factory Pattern
 *
 * Factory pour créer les repositories selon le type de base de données
 * Permet de basculer entre SQL (TypeORM) et NoSQL (MongoDB) facilement
 */

import { Injectable } from '@nestjs/common';
import { RefreshTokenRepository } from '../../../application/use-cases/users/login.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import type { DatabaseType } from '../config/database-config.service';

// Abstract Factory Interface
export interface DatabaseRepositoryFactory {
  createUserRepository(): UserRepository;
  createRefreshTokenRepository(): RefreshTokenRepository;
}

// SQL Factory (TypeORM)
@Injectable()
export class SqlRepositoryFactory implements DatabaseRepositoryFactory {
  createUserRepository(): UserRepository {
    // Lazy loading pour éviter les dépendances circulaires
    const {
      TypeOrmUserRepository,
    } = require('../repositories/sql/user.repository.impl');
    return new TypeOrmUserRepository();
  }

  createRefreshTokenRepository(): RefreshTokenRepository {
    const {
      TypeOrmRefreshTokenRepository,
    } = require('../repositories/sql/refresh-token.repository.impl');
    return new TypeOrmRefreshTokenRepository();
  }
}

// MongoDB Factory (Mongoose)
@Injectable()
export class MongoRepositoryFactory implements DatabaseRepositoryFactory {
  createUserRepository(): UserRepository {
    const {
      MongoUserRepository,
    } = require('../repositories/mongo/user.repository.impl');
    return new MongoUserRepository();
  }

  createRefreshTokenRepository(): RefreshTokenRepository {
    const {
      MongoRefreshTokenRepository,
    } = require('../repositories/mongo/refresh-token.repository.impl');
    return new MongoRefreshTokenRepository();
  }
}

// Factory Provider
@Injectable()
export class DatabaseRepositoryFactoryProvider {
  constructor(private readonly databaseType: DatabaseType) {}

  static create(databaseType: DatabaseType): DatabaseRepositoryFactory {
    switch (databaseType) {
      case 'postgresql':
      case 'mysql':
      case 'sqlite':
        return new SqlRepositoryFactory();

      case 'mongodb':
        return new MongoRepositoryFactory();

      default:
        throw new Error(`Unsupported database type: ${databaseType}`);
    }
  }
}

// Token pour l'injection de dépendance
export const DATABASE_REPOSITORY_FACTORY = Symbol(
  'DATABASE_REPOSITORY_FACTORY',
);

// Provider configuré dynamiquement
export const databaseRepositoryFactoryProvider = {
  provide: DATABASE_REPOSITORY_FACTORY,
  useFactory: (databaseType: DatabaseType) => {
    return DatabaseRepositoryFactoryProvider.create(databaseType);
  },
  inject: ['DATABASE_TYPE'], // Will be provided by configuration
};
