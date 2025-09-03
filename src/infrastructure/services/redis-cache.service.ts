/**
 * 🗄️ REDIS CACHE SERVICE - Implémentation Redis pour le cache
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */

import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
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
export class RedisCacheService
  implements ICacheService, OnModuleInit, OnModuleDestroy
{
  private client: any = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Inject(APPLICATION_TOKENS.LOGGER)
    private readonly logger: Logger,
    @Inject(APPLICATION_TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {}

  /**
   * 🚀 Initialisation asynchrone du module
   */
  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  /**
   * 🔌 Connexion asynchrone à Redis
   */
  private async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this.establishConnection();
    return this.connectionPromise;
  }

  /**
   * 🔗 Établit la connexion Redis
   */
  private async establishConnection(): Promise<void> {
    try {
      this.client = this.createRedisClient();
      this.setupEventHandlers();

      // Tentative de connexion
      await this.client.connect();
      this.isConnected = true;

      this.logger.info(
        this.i18n.t('infrastructure.cache.connection_established'),
        {
          host: this.configService.get<string>('REDIS_HOST', 'localhost'),
          port: this.configService.get<number>('REDIS_PORT', 6379),
        },
      );
    } catch (error) {
      this.isConnected = false;
      this.logger.error(
        this.i18n.t('infrastructure.cache.connection_failed'),
        undefined,
        {
          host: this.configService.get<string>('REDIS_HOST', 'localhost'),
          port: this.configService.get<number>('REDIS_PORT', 6379),
          error: (error as Error).message,
          stack: (error as Error).stack,
        },
      );
      throw new CacheConnectionException('Failed to connect to Redis', {
        originalError: (error as Error).message,
      });
    }
  }

  /**
   * ⏳ Assure que la connexion est établie
   */
  private async ensureConnection(): Promise<void> {
    if (!this.isConnected || !this.client) {
      await this.connect();
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.ensureConnection();

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
    await this.ensureConnection();

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
    await this.ensureConnection();

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
    await this.ensureConnection();

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

  /**
   * 🗑️ Invalide tout le cache d'un utilisateur spécifique
   */
  async invalidateUserCache(userId: string): Promise<void> {
    if (!userId?.trim()) {
      this.logger.warn(this.i18n.t('infrastructure.cache.invalid_user_id'), {
        userId,
      });
      return;
    }

    await this.ensureConnection();

    try {
      // Pattern pour tous les caches liés à cet utilisateur
      const userPattern = `user:${userId}:*`;
      const sessionPattern = `session:${userId}:*`;
      const profilePattern = `profile:${userId}`;

      const patterns = [userPattern, sessionPattern, profilePattern];
      let totalKeysDeleted = 0;

      for (const pattern of patterns) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
          totalKeysDeleted += keys.length;
        }
      }

      this.logger.info(
        this.i18n.t('infrastructure.cache.user_cache_invalidated'),
        {
          userId,
          keysDeleted: totalKeysDeleted,
          patterns,
        },
      );
    } catch (error) {
      this.logger.error(
        this.i18n.t('infrastructure.cache.user_cache_invalidation_failed'),
        error as Error,
        { userId },
      );
      throw new CacheOperationException(
        `Failed to invalidate cache for user ${userId}`,
        { userId, originalError: (error as Error).message },
      );
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    await this.ensureConnection();

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
  /**
   * 🔧 Crée le client Redis avec configuration environnement-spécifique
   */
  private createRedisClient(): any {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const db = this.configService.get<number>('REDIS_DB', 0);
    const environment = this.configService.get<string>(
      'NODE_ENV',
      'development',
    );

    // 🔧 Configuration de base
    const config: any = {
      host,
      port,
      db,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
      lazyConnect: true,
    };

    // 🏗️ Mode développement : pas de password, pas de SSL
    if (environment === 'development' || environment === 'test') {
      this.logger.info(
        '🔧 Redis: Mode développement - sans authentification ni SSL',
      );
    } else {
      // 🏭 Mode production : password obligatoire et SSL activé
      const password = this.configService.get<string>('REDIS_PASSWORD');
      const sslEnabled = this.configService.get<boolean>('SSL_ENABLED', true);

      if (!password) {
        throw new CacheConnectionException(
          'REDIS_PASSWORD is required in production mode',
          { environment },
        );
      }

      config.password = password;

      if (sslEnabled) {
        config.tls = {
          // Accepter les certificats auto-signés en développement uniquement
          rejectUnauthorized: environment === 'production',
        };
        this.logger.info(
          '🔐 Redis: Mode production - avec authentification et SSL activé',
        );
      } else {
        this.logger.info(
          '🔐 Redis: Mode production - avec authentification, SSL désactivé',
        );
      }
    }

    return new Redis(config);
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
    if (this.client) {
      try {
        await this.client.disconnect();
        this.logger.info(this.i18n.t('infrastructure.cache.connection_closed'));
      } catch (error) {
        this.logger.error(
          this.i18n.t('infrastructure.cache.connection_error'),
          error as Error,
        );
      }
    }
  }
}
