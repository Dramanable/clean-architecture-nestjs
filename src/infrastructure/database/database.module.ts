/**
 * 🏭 Database Module - Multi-Database Support
 *
 * Module NestJS qui configure automatiquement SQL ou MongoDB
 * selon la variable d'environnement DATABASE_TYPE
 */

import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';

// Configuration Services
import { AppConfigService } from '../config/app-config.service';
import { DatabaseConfigService } from './config/database-config.service';
import { MongoConfigService } from './config/mongo-config.service';

// SQL Entities
import { RefreshTokenOrmEntity } from './entities/typeorm/refresh-token.entity';
import { UserOrmEntity } from './entities/typeorm/user.entity';

// MongoDB Schemas
import {
  RefreshToken as MongoRefreshToken,
  RefreshTokenSchema,
} from './entities/mongo/refresh-token.schema';
import { User as MongoUser, UserSchema } from './entities/mongo/user.schema';

@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    // Utiliser la variable d'environnement directement
    const databaseType = process.env.DATABASE_TYPE || 'postgresql';

    const baseModule = {
      module: DatabaseModule,
      imports: [ConfigModule],
      providers: [AppConfigService],
      exports: [AppConfigService],
    };

    switch (databaseType) {
      case 'postgresql':
      case 'mysql':
      case 'sqlite':
        return this.createSqlModule(baseModule);

      case 'mongodb':
        return this.createMongoModule(baseModule);

      default:
        throw new Error(`Unsupported database type: ${databaseType}`);
    }
  }

  /**
   * 🐘 Configuration SQL (TypeORM)
   */
  private static createSqlModule(baseModule: DynamicModule): DynamicModule {
    return {
      ...baseModule,
      imports: [
        ...(baseModule.imports || []),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            if (
              configService.get<string>('DATABASE_TYPE', 'postgresql') ===
              'mongodb'
            ) {
              throw new Error(
                'TypeORM configuration requested but MongoDB is configured. Use Mongoose instead.',
              );
            }

            const isProduction =
              configService.get<string>('NODE_ENV', 'development') ===
              'production';

            return {
              type: 'postgres',
              host: configService.get<string>('DATABASE_HOST', 'localhost'),
              port: configService.get<number>('DATABASE_PORT', 5432),
              username: configService.get<string>('DATABASE_USERNAME', 'admin'),
              password: configService.get<string>('DATABASE_PASSWORD'),
              database: configService.get<string>(
                'DATABASE_NAME',
                'cleanarchi',
              ),

              // Entités SQL
              entities: [UserOrmEntity, RefreshTokenOrmEntity],

              // Configuration development vs production
              synchronize: !isProduction,
              logging: !isProduction,
              dropSchema: false,

              // Pool de connexion
              extra: {
                max: configService.get<number>('DATABASE_POOL_SIZE', 10),
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000,
              },

              // SSL Configuration
              ssl: false,

              // Migration configuration
              migrations: ['dist/infrastructure/database/migrations/sql/*.js'],
              migrationsRun: false,
              migrationsTableName: 'sql_migrations_history',
            };
          },
          inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([UserOrmEntity, RefreshTokenOrmEntity]),
      ],
      providers: [...(baseModule.providers || []), DatabaseConfigService],
      exports: [
        ...(baseModule.exports || []),
        DatabaseConfigService,
        TypeOrmModule,
      ],
    };
  }

  /**
   * 🍃 Configuration MongoDB (Mongoose)
   */
  private static createMongoModule(baseModule: DynamicModule): DynamicModule {
    return {
      ...baseModule,
      imports: [
        ...(baseModule.imports || []),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useClass: MongoConfigService,
          inject: [AppConfigService],
        }),
        MongooseModule.forFeature([
          { name: MongoUser.name, schema: UserSchema },
          { name: MongoRefreshToken.name, schema: RefreshTokenSchema },
        ]),
      ],
      providers: [...(baseModule.providers || []), MongoConfigService],
      exports: [
        ...(baseModule.exports || []),
        MongoConfigService,
        MongooseModule,
      ],
    };
  }

  /**
   * 🧪 Configuration pour les tests
   */
  static forTesting(databaseType: 'sql' | 'mongo' = 'sql'): DynamicModule {
    const baseModule = {
      module: DatabaseModule,
      providers: [AppConfigService],
      exports: [AppConfigService],
    };

    if (databaseType === 'sql') {
      return {
        ...baseModule,
        imports: [
          TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [UserOrmEntity, RefreshTokenOrmEntity],
            synchronize: true,
            logging: false,
          }),
          TypeOrmModule.forFeature([UserOrmEntity, RefreshTokenOrmEntity]),
        ],
        exports: [...baseModule.exports, TypeOrmModule],
      };
    } else {
      return {
        ...baseModule,
        imports: [
          MongooseModule.forRoot('mongodb://localhost:27017/test'),
          MongooseModule.forFeature([
            { name: MongoUser.name, schema: UserSchema },
            { name: MongoRefreshToken.name, schema: RefreshTokenSchema },
          ]),
        ],
        exports: [...baseModule.exports, MongooseModule],
      };
    }
  }
}
