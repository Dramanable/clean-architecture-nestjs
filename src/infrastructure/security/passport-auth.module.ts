/**
 * 🔐 PASSPORT MODULE - Module d'authentification Passport.js avec Clean Architecture
 *
 * Configure toutes les strategies Passport.js et les intègre avec l'infrastructure existante
 *
 * ⚠️ IMPORTANT: Ce module doit être importé APRÈS le module Infrastructure
 * pour avoir accès aux Use Cases selon Clean Architecture (Jonathan Pretre)
 */

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { CacheModule } from '../cache/cache.module';
import { PinoLoggerModule } from '../logging/pino-logger.module';
import { TOKENS } from '../../shared/constants/injection-tokens';

// Import des entités et repositories nécessaires
import { UserOrmEntity } from '../database/entities/typeorm/user.entity';
import { TypeOrmUserRepository } from '../database/repositories/typeorm-user.repository';
import { UserMapper } from '../database/mappers/user.mapper';

// Import du service de password pour LocalStrategy
import { PassportPasswordService } from './services/passport-password.service';

/**
 * 🌍 Passport I18n Service - Service I18n pour les strategies Passport
 */
class PassportI18nService {
  t(key: string, params?: Record<string, unknown>): string {
    const translations: Record<string, string> = {
      // Auth operations
      'auth.jwt_validation_attempt': 'JWT validation attempt',
      'auth.jwt_validation_success': 'JWT validation successful',
      'auth.jwt_validation_failed': 'JWT validation failed',
      'auth.user_not_found': 'User not found during authentication',
      'auth.local_validation_attempt': 'Local strategy validation attempt',
      'auth.local_validation_success': 'Local strategy validation successful',
      'auth.local_validation_failed': 'Local strategy validation failed',
      'auth.invalid_credentials': 'Invalid email or password',
      'auth.missing_credentials': 'Missing email or password',
      'auth.invalid_email_format': 'Invalid email format',
      'auth.invalid_password': 'Invalid password provided',
      'auth.authentication_error': 'Authentication error occurred',
    };

    let result = translations[key] || key;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value));
      });
    }
    return result;
  }
}

@Module({
  imports: [
    // 🔒 Configuration de base Passport.js
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false, // Stateless authentication avec JWT
    }),

    // 🗄️ TypeORM pour les repositories
    TypeOrmModule.forFeature([UserOrmEntity]),

    // 🗄️ Module de cache Redis (requis par JwtStrategy)
    CacheModule,

    // 📝 Module de logging (requis par JwtStrategy)
    PinoLoggerModule,

    // 🎫 Configuration JWT pour les strategies
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>(
            'ACCESS_TOKEN_EXPIRATION',
            '15m',
          ),
          issuer: configService.get<string>(
            'JWT_ISSUER',
            'clean-architecture-app',
          ),
          audience: configService.get<string>(
            'JWT_AUDIENCE',
            'clean-architecture-users',
          ),
        },
      }),
    }),
  ],
  providers: [
    // 🌍 Service I18n pour les strategies Passport
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: PassportI18nService,
    },

    // 🗂️ Mappers
    UserMapper,
    {
      provide: TOKENS.USER_MAPPER,
      useClass: UserMapper,
    },

    // 🗂️ Repositories
    TypeOrmUserRepository,
    {
      provide: TOKENS.USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },

    // 🔐 Password Service for LocalStrategy
    PassportPasswordService,
    {
      provide: TOKENS.BCRYPT_PASSWORD_SERVICE,
      useClass: PassportPasswordService,
    },

    // 🎯 Strategies d'authentification
    {
      provide: TOKENS.JWT_STRATEGY,
      useClass: JwtStrategy,
    },
    {
      provide: TOKENS.LOCAL_STRATEGY,
      useClass: LocalStrategy,
    },

    // Export des strategies pour usage dans d'autres modules
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [
    PassportModule,
    JwtModule,
    JwtStrategy,
    LocalStrategy,
    TOKENS.JWT_STRATEGY,
    TOKENS.LOCAL_STRATEGY,
  ],
})
export class PassportAuthModule {}
