/**
 * 🧪 REDIS CACHE SERVICE TESTS - Tests unitaires pour RedisCacheService
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from './redis-cache.service';
import { APPLICATION_TOKENS } from '../../shared/constants/injection-tokens';
import {
  CacheConnectionException,
  CacheOperationException,
} from '../../application/exceptions/cache.exceptions';

// Mock Redis
const mockRedisClient = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  setex: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  keys: jest.fn(),
  on: jest.fn(),
};

// Mock ioredis constructor
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

describe('RedisCacheService', () => {
  let service: RedisCacheService;
  let configService: jest.Mocked<ConfigService>;
  let mockLogger: any;
  let mockI18n: any;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock dependencies
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    mockI18n = {
      t: jest.fn().mockImplementation((key: string) => `mocked_${key}`),
    };

    const mockConfigService = {
      get: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisCacheService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: APPLICATION_TOKENS.LOGGER,
          useValue: mockLogger,
        },
        {
          provide: APPLICATION_TOKENS.I18N_SERVICE,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get<RedisCacheService>(RedisCacheService);
    configService = module.get(ConfigService);
  });

  describe('Configuration Tests', () => {
    describe('Development Mode', () => {
      beforeEach(() => {
        configService.get.mockImplementation(
          (key: string, defaultValue?: any) => {
            const config: Record<string, any> = {
              NODE_ENV: 'development',
              REDIS_HOST: 'localhost',
              REDIS_PORT: 6379,
              REDIS_DB: 0,
            };
            return config[key] ?? defaultValue;
          },
        );
      });

      it('should create Redis client without password and SSL in development', async () => {
        mockRedisClient.connect.mockResolvedValue(undefined);

        await service.onModuleInit();

        expect(mockLogger.info).toHaveBeenCalledWith(
          '🔧 Redis: Mode développement - sans authentification ni SSL',
        );
        expect(mockRedisClient.connect).toHaveBeenCalled();
      });

      it('should not require password in development', async () => {
        mockRedisClient.connect.mockResolvedValue(undefined);

        // Ne pas définir REDIS_PASSWORD
        expect(async () => {
          await service.onModuleInit();
        }).not.toThrow();
      });
    });

    describe('Production Mode', () => {
      beforeEach(() => {
        configService.get.mockImplementation(
          (key: string, defaultValue?: any) => {
            const config: Record<string, any> = {
              NODE_ENV: 'production',
              REDIS_HOST: 'redis.production.com',
              REDIS_PORT: 6379,
              REDIS_DB: 0,
              REDIS_PASSWORD: 'super-secure-password',
              SSL_ENABLED: true,
            };
            return config[key] ?? defaultValue;
          },
        );
      });

      it('should create Redis client with password and SSL in production', async () => {
        mockRedisClient.connect.mockResolvedValue(undefined);

        await service.onModuleInit();

        expect(mockLogger.info).toHaveBeenCalledWith(
          '🔐 Redis: Mode production - avec authentification et SSL activé',
        );
        expect(mockRedisClient.connect).toHaveBeenCalled();
      });

      it('should throw error if password is missing in production', async () => {
        configService.get.mockImplementation(
          (key: string, defaultValue?: any) => {
            const config: Record<string, any> = {
              NODE_ENV: 'production',
              REDIS_HOST: 'redis.production.com',
              REDIS_PORT: 6379,
              REDIS_DB: 0,
              // REDIS_PASSWORD manquant
              SSL_ENABLED: true,
            };
            return config[key] ?? defaultValue;
          },
        );

        await expect(service.onModuleInit()).rejects.toThrow(
          CacheConnectionException,
        );
      });

      it('should create Redis client with password but without SSL when disabled', async () => {
        configService.get.mockImplementation(
          (key: string, defaultValue?: any) => {
            const config: Record<string, any> = {
              NODE_ENV: 'production',
              REDIS_HOST: 'redis.production.com',
              REDIS_PORT: 6379,
              REDIS_DB: 0,
              REDIS_PASSWORD: 'super-secure-password',
              SSL_ENABLED: false,
            };
            return config[key] ?? defaultValue;
          },
        );

        mockRedisClient.connect.mockResolvedValue(undefined);

        await service.onModuleInit();

        expect(mockLogger.info).toHaveBeenCalledWith(
          '🔐 Redis: Mode production - avec authentification, SSL désactivé',
        );
        expect(mockRedisClient.connect).toHaveBeenCalled();
      });
    });
  });

  describe('Cache Operations', () => {
    beforeEach(async () => {
      // Configuration par défaut pour dev
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            NODE_ENV: 'development',
            REDIS_HOST: 'localhost',
            REDIS_PORT: 6379,
            REDIS_DB: 0,
          };
          return config[key] ?? defaultValue;
        },
      );

      mockRedisClient.connect.mockResolvedValue(undefined);
      await service.onModuleInit();
    });

    describe('set', () => {
      it('should successfully set cache value', async () => {
        mockRedisClient.setex.mockResolvedValue('OK');

        await service.set('test-key', 'test-value', 3600);

        expect(mockRedisClient.setex).toHaveBeenCalledWith(
          'test-key',
          3600,
          'test-value',
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'mocked_infrastructure.cache.set_success',
          {
            key: 'test-key',
            ttl: 3600,
          },
        );
      });

      it('should throw CacheOperationException on set failure', async () => {
        const error = new Error('Redis SET failed');
        mockRedisClient.setex.mockRejectedValue(error);

        await expect(
          service.set('test-key', 'test-value', 3600),
        ).rejects.toThrow(CacheOperationException);

        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe('get', () => {
      it('should successfully get cache value', async () => {
        mockRedisClient.get.mockResolvedValue('test-value');

        const result = await service.get('test-key');

        expect(result).toBe('test-value');
        expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'mocked_infrastructure.cache.get_attempt',
          {
            key: 'test-key',
            found: true,
          },
        );
      });

      it('should return null for non-existent key', async () => {
        mockRedisClient.get.mockResolvedValue(null);

        const result = await service.get('non-existent-key');

        expect(result).toBeNull();
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'mocked_infrastructure.cache.get_attempt',
          {
            key: 'non-existent-key',
            found: false,
          },
        );
      });

      it('should throw CacheOperationException on get failure', async () => {
        const error = new Error('Redis GET failed');
        mockRedisClient.get.mockRejectedValue(error);

        await expect(service.get('test-key')).rejects.toThrow(
          CacheOperationException,
        );

        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe('delete', () => {
      it('should successfully delete cache key', async () => {
        mockRedisClient.del.mockResolvedValue(1);

        await service.delete('test-key');

        expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'mocked_infrastructure.cache.delete_success',
          { key: 'test-key', deleted: true },
        );
      });

      it('should throw CacheOperationException on delete failure', async () => {
        const error = new Error('Redis DEL failed');
        mockRedisClient.del.mockRejectedValue(error);

        await expect(service.delete('test-key')).rejects.toThrow(
          CacheOperationException,
        );

        expect(mockLogger.error).toHaveBeenCalled();
      });
    });

    describe('exists', () => {
      it('should return true for existing key', async () => {
        mockRedisClient.exists.mockResolvedValue(1);

        const result = await service.exists('test-key');

        expect(result).toBe(true);
        expect(mockRedisClient.exists).toHaveBeenCalledWith('test-key');
      });

      it('should return false for non-existent key', async () => {
        mockRedisClient.exists.mockResolvedValue(0);

        const result = await service.exists('non-existent-key');

        expect(result).toBe(false);
      });

      it('should throw CacheOperationException on exists failure', async () => {
        const error = new Error('Redis EXISTS failed');
        mockRedisClient.exists.mockRejectedValue(error);

        await expect(service.exists('test-key')).rejects.toThrow(
          CacheOperationException,
        );
      });
    });

    describe('invalidateUserCache', () => {
      it('should successfully invalidate user cache', async () => {
        mockRedisClient.keys
          .mockResolvedValueOnce(['user:123:profile', 'user:123:settings'])
          .mockResolvedValueOnce(['profile:123']);

        mockRedisClient.del.mockResolvedValue(1);

        await service.invalidateUserCache('123');

        expect(mockRedisClient.keys).toHaveBeenCalledWith('user:123:*');
        expect(mockRedisClient.keys).toHaveBeenCalledWith('profile:123');

        expect(mockRedisClient.del).toHaveBeenCalledWith(
          'user:123:profile',
          'user:123:settings',
        );
        expect(mockRedisClient.del).toHaveBeenCalledWith('profile:123');

        expect(mockLogger.info).toHaveBeenCalledWith(
          'User cache invalidated successfully',
          { userId: '123' },
        );
      });

      it('should handle empty user ID', async () => {
        await service.invalidateUserCache('');

        expect(mockLogger.warn).toHaveBeenCalledWith(
          'Attempted to invalidate cache with empty user ID',
        );
        expect(mockRedisClient.keys).not.toHaveBeenCalled();
      });

      it('should handle cache invalidation errors gracefully', async () => {
        const error = new Error('Redis KEYS failed');
        mockRedisClient.keys.mockRejectedValue(error);

        await service.invalidateUserCache('123');

        expect(mockLogger.error).toHaveBeenCalledWith(
          'Failed to invalidate user cache',
          error,
          { userId: '123' },
        );
      });
    });
  });

  describe('Connection Management', () => {
    beforeEach(() => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            NODE_ENV: 'development',
            REDIS_HOST: 'localhost',
            REDIS_PORT: 6379,
            REDIS_DB: 0,
          };
          return config[key] ?? defaultValue;
        },
      );
    });

    it('should handle connection failure', async () => {
      const error = new Error('Connection failed');
      mockRedisClient.connect.mockRejectedValue(error);

      await expect(service.onModuleInit()).rejects.toThrow(
        CacheConnectionException,
      );

      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should setup event handlers correctly', async () => {
      mockRedisClient.connect.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockRedisClient.on).toHaveBeenCalledWith(
        'connect',
        expect.any(Function),
      );
      expect(mockRedisClient.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function),
      );
      expect(mockRedisClient.on).toHaveBeenCalledWith(
        'close',
        expect.any(Function),
      );
      expect(mockRedisClient.on).toHaveBeenCalledWith(
        'reconnecting',
        expect.any(Function),
      );
    });

    it('should disconnect properly on module destroy', async () => {
      mockRedisClient.connect.mockResolvedValue(undefined);
      mockRedisClient.disconnect.mockResolvedValue(undefined);

      await service.onModuleInit();
      await service.onModuleDestroy();

      expect(mockRedisClient.disconnect).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'mocked_infrastructure.cache.connection_closed',
      );
    });

    it('should handle disconnect errors gracefully', async () => {
      mockRedisClient.connect.mockResolvedValue(undefined);
      const error = new Error('Disconnect failed');
      mockRedisClient.disconnect.mockRejectedValue(error);

      await service.onModuleInit();
      await service.onModuleDestroy();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'mocked_infrastructure.cache.connection_error',
        error,
      );
    });
  });

  describe('Environment-specific Configuration', () => {
    it('should handle staging environment like production', async () => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            NODE_ENV: 'staging',
            REDIS_HOST: 'redis.staging.com',
            REDIS_PORT: 6379,
            REDIS_DB: 0,
            REDIS_PASSWORD: 'staging-password',
            SSL_ENABLED: true,
          };
          return config[key] ?? defaultValue;
        },
      );

      mockRedisClient.connect.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockLogger.info).toHaveBeenCalledWith(
        '🔐 Redis: Mode production - avec authentification et SSL activé',
      );
    });

    it('should handle test environment like development', async () => {
      configService.get.mockImplementation(
        (key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            NODE_ENV: 'test',
            REDIS_HOST: 'localhost',
            REDIS_PORT: 6379,
            REDIS_DB: 1,
          };
          return config[key] ?? defaultValue;
        },
      );

      // Spy on createRedisClient to return our mock
      jest
        .spyOn(service as any, 'createRedisClient')
        .mockReturnValue(mockRedisClient);
      mockRedisClient.connect.mockResolvedValue(undefined);

      await service.onModuleInit();

      // In test environment, should connect successfully (like development)
      expect(mockRedisClient.connect).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        'mocked_infrastructure.cache.connection_established',
        {
          host: 'localhost',
          port: 6379,
        },
      );
    });
  });
});
