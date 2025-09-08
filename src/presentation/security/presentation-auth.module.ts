/**
 * 🎨 PRESENTATION AUTH MODULE - Authentification couche présentation
 *
 * Module de sécurité pour la couche présentation selon Clean Architecture :
 * - Guards HTTP pour protéger les routes
 * - Stratégies Passport pour l'authentification
 * - Décorateurs pour les endpoints
 */

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

// Infrastructure dependencies
import { InfrastructureModule } from '../../infrastructure/infrastructure.module';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { PinoLoggerModule } from '../../infrastructure/logging/pino-logger.module';
import { BcryptPasswordService } from '../../infrastructure/services/bcrypt-password.service';
import { TypeOrmUserRepository } from '../../infrastructure/database/repositories/typeorm-user.repository';
import { UserMapper } from '../../infrastructure/database/mappers/typeorm-user.mapper';
import { TOKENS } from '../../shared/constants/injection-tokens';

// Strategies (restent dans infrastructure car techniques)
import { LocalStrategy } from '../../infrastructure/security/strategies/local.strategy';
import { JwtStrategy } from '../../infrastructure/security/strategies/jwt.strategy';

// Guards (maintenant dans présentation)
import { LocalAuthGuard } from '../../infrastructure/security/local-auth.guard';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';

/**
 * 🌍 I18n Service pour l'authentification
 */
class AuthI18nService {
  t(key: string): string {
    const translations: Record<string, string> = {
      // Local Strategy
      'auth.local_validation_attempt': 'Local authentication attempt',
      'auth.user_not_found': 'User not found during authentication',
      'auth.no_password_hash': 'No password hash found for user',
      'auth.invalid_password': 'Invalid password provided',
      'auth.local_validation_success': 'Local authentication successful',
      'auth.invalid_credentials': 'Invalid authentication credentials',
      'auth.local_validation_error': 'Local authentication error',

      // JWT Strategy
      'auth.jwt_validation_attempt': 'JWT authentication attempt',
      'auth.email_mismatch_jwt': 'Email mismatch in JWT token',
      'auth.user_not_found_jwt': 'User not found in JWT validation',
      'auth.jwt_validation_success': 'JWT authentication successful',
    };

    return translations[key] || `Missing translation: ${key}`;
  }
}

/**
 * 🔐 Presentation Authentication Module
 *
 * Respecte la Clean Architecture :
 * - Presentation Layer : Guards, décorateurs HTTP
 * - Application Layer : Use cases d'authentification (via InfrastructureModule)
 * - Infrastructure Layer : Stratégies techniques Passport
 */
@Module({
  imports: [
    // Configuration Passport
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),

    // Configuration JWT
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const accessTokenSecret = configService.get<string>(
          'ACCESS_TOKEN_SECRET',
        );
        const expirationTime = configService.get<number>(
          'ACCESS_TOKEN_EXPIRATION',
        );

        if (!accessTokenSecret) {
          throw new Error('ACCESS_TOKEN_SECRET is required');
        }
        if (!expirationTime) {
          throw new Error('ACCESS_TOKEN_EXPIRATION is required');
        }

        return {
          secret: accessTokenSecret,
          signOptions: {
            expiresIn: `${expirationTime}s`,
          },
        };
      },
    }),

    // Dependencies from infrastructure
    InfrastructureModule,
    DatabaseModule,
    PinoLoggerModule,
  ],

  providers: [
    // Services nécessaires pour les stratégies
    {
      provide: TOKENS.BCRYPT_PASSWORD_SERVICE,
      useClass: BcryptPasswordService,
    },
    {
      provide: TOKENS.USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: TOKENS.USER_MAPPER,
      useClass: UserMapper,
    },
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: AuthI18nService,
    },

    // Stratégies Passport (techniques, mais nécessaires ici)
    LocalStrategy,
    JwtStrategy,

    // Guards pour authentification
    LocalAuthGuard,
    JwtAuthGuard,
  ],

  exports: [
    // Export guards pour utilisation dans controllers
    LocalAuthGuard,
    JwtAuthGuard,

    // Export strategies si nécessaire
    LocalStrategy,
    JwtStrategy,
  ],
})
export class PresentationAuthModule {}
