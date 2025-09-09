/**
 * 🏭 INFRASTRUCTURE - Dynamic Repository Module
 *
 * Module NestJS sophistiqué qui configure automatiquement les repositories
 * selon la variable d'environnement DATABASE_TYPE (postgresql vs mongodb)
 * Respect absolu de Clean Architecture + SOLID principles
 */

import { DynamicModule, Module, Provider } from '@nestjs/common';
import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import type { IUserRepository } from '../../../application/ports/user.repository.interface';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import { AppConfigService } from '../../config/app-config.service';

// Type pour les implémentations de repositories
type DatabaseType = 'postgresql' | 'mongodb' | 'mysql' | 'sqlite';

@Module({})
export class DynamicRepositoryModule {
  /**
   * 🎯 Configuration dynamique des repositories selon DATABASE_TYPE
   */
  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      // Provider dynamique pour USER_REPOSITORY
      {
        provide: TOKENS.USER_REPOSITORY,
        useFactory: async (
          configService: AppConfigService,
          logger: Logger,
          i18n: I18nService,
        ): Promise<IUserRepository> => {
          const databaseType = configService.getDatabaseType();
          
          logger.info('Configuring repository for database type', { databaseType });

          switch (databaseType) {
            case 'postgresql':
            case 'mysql':
            case 'sqlite':
              return DynamicRepositoryModule.createSqlUserRepository(logger, i18n);

            case 'mongodb':
              return DynamicRepositoryModule.createMongoUserRepository(logger, i18n);

            default:
              throw new Error(
                `🚨 Unsupported database type: ${String(databaseType)}. ` +
                'Supported types: postgresql, mongodb, mysql, sqlite'
              );
          }
        },
        inject: [AppConfigService, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
      },

      // Provider dynamique pour REFRESH_TOKEN_REPOSITORY  
      {
        provide: TOKENS.REFRESH_TOKEN_REPOSITORY,
        useFactory: async (
          configService: AppConfigService,
          logger: Logger,
          i18n: I18nService,
        ) => {
          const databaseType = configService.getDatabaseType();

          switch (databaseType) {
            case 'postgresql':
            case 'mysql':
            case 'sqlite':
              return DynamicRepositoryModule.createSqlRefreshTokenRepository(logger, i18n);

            case 'mongodb':
              return DynamicRepositoryModule.createMongoRefreshTokenRepository(logger, i18n);

            default:
              throw new Error(`Unsupported database type: ${String(databaseType)}`);
          }
        },
        inject: [AppConfigService, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
      },
    ];

    return {
      module: DynamicRepositoryModule,
      providers,
      exports: [
        TOKENS.USER_REPOSITORY,
        TOKENS.REFRESH_TOKEN_REPOSITORY,
      ],
    };
  }

  /**
   * 🐘 Factory pour repositories SQL (TypeORM)
   */
  private static async createSqlUserRepository(
    logger: Logger,
    i18n: I18nService,
  ): Promise<IUserRepository> {
    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { TypeOrmUserRepository } = await import('../repositories/typeorm-user.repository');
      const { UserMapper } = await import('../mappers/typeorm-user.mapper');
      
      // Note: En production, ces dépendances seraient injectées via le DI container
      // Pour l'instant, on simule l'injection
      logger.info('Creating TypeORM User Repository');
      
      // TODO: Proper dependency injection needed here
      // Cette implémentation nécessiterait une refactorisation plus profonde
      // pour injecter correctement Repository<UserOrmEntity> et UserMapper
      throw new Error('SQL Repository creation needs proper DI container integration');
      
    } catch (error) {
      logger.error('Failed to create SQL User Repository', error as Error);
      throw error;
    }
  }

  /**
   * 🍃 Factory pour repositories MongoDB (Mongoose)
   */
  private static async createMongoUserRepository(
    logger: Logger,
    i18n: I18nService,
  ): Promise<IUserRepository> {
    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { MongoUserRepository } = await import('../repositories/mongo/user.repository.impl');
      
      logger.info('Creating MongoDB User Repository');
      
      // TODO: Proper Model<UserDocument> injection needed
      // Cette implémentation nécessiterait une refactorisation plus profonde
      throw new Error('MongoDB Repository creation needs proper Model injection');
      
    } catch (error) {
      logger.error('Failed to create MongoDB User Repository', error as Error);
      throw error;
    }
  }

  /**
   * 🐘 Factory pour RefreshToken SQL Repository
   */
  private static async createSqlRefreshTokenRepository(
    logger: Logger,
    i18n: I18nService,
  ) {
    try {
      const { TypeOrmRefreshTokenRepository } = await import('../repositories/typeorm-refresh-token.repository');
      
      logger.info('Creating TypeORM RefreshToken Repository');
      
      // TODO: Proper Repository<RefreshTokenOrmEntity> injection needed
      throw new Error('SQL RefreshToken Repository creation needs proper DI container integration');
      
    } catch (error) {
      logger.error('Failed to create SQL RefreshToken Repository', error as Error);
      throw error;
    }
  }

  /**
   * 🍃 Factory pour RefreshToken MongoDB Repository
   */
  private static async createMongoRefreshTokenRepository(
    logger: Logger,
    i18n: I18nService,
  ) {
    try {
      const { MongoRefreshTokenRepository } = await import('../repositories/mongo/refresh-token.repository.impl');
      
      logger.info('Creating MongoDB RefreshToken Repository');
      
      // TODO: Proper Model<RefreshTokenDocument> injection needed
      throw new Error('MongoDB RefreshToken Repository creation needs proper Model injection');
      
    } catch (error) {
      logger.error('Failed to create MongoDB RefreshToken Repository', error as Error);
      throw error;
    }
  }
}
