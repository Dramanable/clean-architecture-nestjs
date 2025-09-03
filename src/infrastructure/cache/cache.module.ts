/**
 * 🗄️ CACHE MODULE - Module Redis pour le cache et les sessions
 */

import { Module } from '@nestjs/common';
import { RedisCacheService } from '../services/redis-cache.service';
import { UserSessionService } from '../services/user-session.service';
import { CookieService } from '../services/cookie.service';
import { PinoLoggerModule } from '../logging/pino-logger.module';
import { TOKENS } from '../../shared/constants/injection-tokens';

/**
 * 🌍 Cache I18n Service - Service I18n pour le module de cache
 */
class CacheI18nService {
  t(key: string, params?: Record<string, unknown>): string {
    const translations: Record<string, string> = {
      // Cache operations
      'infrastructure.cache.set_success': 'Cache SET successful',
      'infrastructure.cache.set_failed': 'Cache SET failed',
      'infrastructure.cache.get_attempt': 'Cache GET attempt',
      'infrastructure.cache.get_failed': 'Cache GET failed',
      'infrastructure.cache.delete_success': 'Cache DELETE successful',
      'infrastructure.cache.delete_failed': 'Cache DELETE failed',
      'infrastructure.cache.exists_success': 'Cache EXISTS successful',
      'infrastructure.cache.exists_failed': 'Cache EXISTS failed',
      'infrastructure.cache.keys_success': 'Cache KEYS successful',
      'infrastructure.cache.keys_failed': 'Cache KEYS failed',
      'infrastructure.cache.connection_success': 'Redis connection established',
      'infrastructure.cache.connection_failed': 'Redis connection failed',
      'infrastructure.cache.connection_closed': 'Redis connection closed',
      'infrastructure.cache.connection_error': 'Redis connection error',
      // Session operations
      'infrastructure.session.create_attempt': 'Creating user session',
      'infrastructure.session.create_success': 'User session created',
      'infrastructure.session.create_failed': 'Failed to create user session',
      'infrastructure.session.get_attempt': 'Getting user session',
      'infrastructure.session.get_success': 'User session retrieved',
      'infrastructure.session.get_failed': 'Failed to get user session',
      'infrastructure.session.invalidate_attempt': 'Invalidating user session',
      'infrastructure.session.invalidate_success': 'User session invalidated',
      'infrastructure.session.invalidate_failed':
        'Failed to invalidate session',
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
    // 📝 Module de logging global
    PinoLoggerModule,
  ],
  providers: [
    // 🌍 Service I18n pour le cache
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: CacheI18nService,
    },
    // 🗄️ Service de cache Redis
    {
      provide: TOKENS.CACHE_SERVICE,
      useClass: RedisCacheService,
    },
    // 👤 Service de gestion des sessions utilisateur
    {
      provide: TOKENS.USER_SESSION_SERVICE,
      useClass: UserSessionService,
    },
    // 🍪 Service de gestion des cookies
    {
      provide: TOKENS.COOKIE_SERVICE,
      useClass: CookieService,
    },
  ],
  exports: [
    TOKENS.CACHE_SERVICE,
    TOKENS.USER_SESSION_SERVICE,
    TOKENS.COOKIE_SERVICE,
  ],
})
export class CacheModule {}
