/**
 * 🛡️ SECURITY MODULE - Module pour la sécurité globale
 *
 * Module qui configure les guards et la sécurité de l'application
 */

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { GlobalAuthGuard } from './global-auth.guard';
import { CacheModule } from '../cache/cache.module';
import { PinoLoggerModule } from '../logging/pino-logger.module';
import { TOKENS } from '../../shared/constants/injection-tokens';

/**
 * 🌍 Security I18n Service - Service I18n pour le module de sécurité
 */
class SecurityI18nService {
  t(key: string, params?: Record<string, unknown>): string {
    const translations: Record<string, string> = {
      // Auth operations
      'auth.public_route_accessed':
        'Public route accessed without authentication',
      'auth.token_extracted_from_cookie': 'JWT token extracted from cookie',
      'auth.no_token_found': 'No authentication token found',
      'auth.token_verification_failed': 'Token verification failed',
      'auth.session_validation_failed': 'Session validation failed',
      'auth.authentication_successful': 'Authentication successful',
      'auth.user_authenticated': 'User authenticated successfully',
      'auth.user_session_validated': 'User session validated',
      'errors.auth.unauthorized': 'Unauthorized access',
      'errors.auth.invalid_token': 'Invalid authentication token',
      'errors.auth.session_not_found': 'User session not found',
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
    // 🗄️ Module de cache (Redis + Sessions)
    CacheModule,

    // 📝 Module de logging
    PinoLoggerModule,

    // 🔑 Configuration JWT globale avec ConfigService
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<number>('ACCESS_TOKEN_EXPIRATION')}s`,
        },
      }),
    }),
  ],
  providers: [
    // 🌍 Service I18n pour la sécurité
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: SecurityI18nService,
    },
    // 🛡️ Guard global pour authentification
    GlobalAuthGuard,
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
  ],
  exports: [GlobalAuthGuard, JwtModule, CacheModule],
})
export class SecurityModule {}
