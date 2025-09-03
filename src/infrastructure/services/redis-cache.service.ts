/**
 * 🗄️ REDIS CACHE SERVICE - Implémentation Redis pour le cache
 */

import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ICacheService } from '../../application/ports/cache.port';
import type { Logger } from '../../application/ports/logger.port';
import type { I18nService } from '../../application/ports/i18n.port';
import { APPLICATION_TOKENS } from '../../shared/constants/injection-tokens';
import {
  CacheConnectionException,
  CacheOperationException,
} from '../../application/exceptions/cache.exceptions';

@Injectable()
export class RedisCacheService implements ICacheService {
  private readonly client: Redis;

  constructor(
    private readonly configService: ConfigService,
    @Inject(APPLICATION_TOKENS.LOGGER)
    private readonly logger: Logger,
    @Inject(APPLICATION_TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {
    this.client = this.createRedisClient();
    this.setupEventHandlers();
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.setex(key, ttlSeconds, value);

      this.logger.debug(this.i18n.t('infrastructure.cache.set_success'), {
        key,
        ttl: ttlSeconds,
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.cache.set_failed'),
        error as Error,
        { key, ttl: ttlSeconds },
      );
      throw new CacheOperationException('SET', { key, ttl: ttlSeconds });
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);

      this.logger.debug(this.i18n.t('infrastructure.cache.get_attempt'), {
        key,
        found: !!value,
      });

      return value;
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.cache.get_failed'),
        error as Error,
        { key },
      );
      throw new CacheOperationException('GET', { key });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const deleted = await this.client.del(key);

      this.logger.debug(this.i18n.t('infrastructure.cache.delete_success'), {
        key,
        deleted: deleted > 0,
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.cache.delete_failed'),
        error as Error,
        { key },
      );
      throw new CacheOperationException('DELETE', { key });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const exists = await this.client.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.cache.exists_failed'),
        error as Error,
        { key },
      );
      throw new CacheOperationException('EXISTS', { key });
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(pattern);

      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.debug(
          this.i18n.t('infrastructure.cache.pattern_delete_success'),
          { pattern, keysCount: keys.length },
        );
      }
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.cache.pattern_delete_failed'),
        error as Error,
        { pattern },
      );
      throw new CacheOperationException('DELETE_PATTERN', { pattern });
    }
  }

  /**
   * 🔧 Crée le client Redis avec configuration
   */
  private createRedisClient(): Redis {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');
    const db = this.configService.get<number>('REDIS_DB', 0);

    return new Redis({
      host,
      port,
      password,
      db,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }

  /**
   * 📡 Configure les gestionnaires d'événements Redis
   */
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.logger.info(
        this.i18n.t('infrastructure.cache.connection_established'),
      );
    });

    this.client.on('error', (error: Error) => {
      this.logger.error(
        this.i18n.t('infrastructure.cache.connection_error'),
        error,
      );
    });

    this.client.on('close', () => {
      this.logger.warn(this.i18n.t('infrastructure.cache.connection_closed'));
    });

    this.client.on('reconnecting', () => {
      this.logger.info(this.i18n.t('infrastructure.cache.reconnecting'));
    });
  }

  /**
   * 🧹 Ferme la connexion Redis
   */
  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
    this.logger.info(this.i18n.t('infrastructure.cache.disconnected'));
  }
}
