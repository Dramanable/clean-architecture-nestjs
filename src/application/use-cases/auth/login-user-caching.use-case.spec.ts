/**
 * 🧪 LOGIN USE CASE - Test de mise en cache utilisateur
 *
 * Test spécifique pour valider que l'utilisateur est mis en cache après login
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase - User Caching', () => {
  let useCase: LoginUseCase;
  let mockUserRepository: any;
  let mockRefreshTokenRepository: any;
  let mockTokenService: any;
  let mockPasswordService: any;
  let mockCacheService: any;
  let mockLogger: any;
  let mockI18n: any;
  let mockConfig: any;

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
    };

    mockRefreshTokenRepository = {
      save: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };

    mockTokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
    };

    mockPasswordService = {
      compare: jest.fn(),
    };

    mockCacheService = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    mockI18n = {
      t: jest.fn().mockReturnValue('Mock message'),
    };

    mockConfig = {
      getAccessTokenSecret: jest.fn().mockReturnValue('access-secret'),
      getAccessTokenExpirationTime: jest.fn().mockReturnValue(900),
      getRefreshTokenSecret: jest.fn().mockReturnValue('refresh-secret'),
      getRefreshTokenExpirationDays: jest.fn().mockReturnValue(7),
      getUserSessionDurationMinutes: jest.fn().mockReturnValue(30), // 30 minutes
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: TOKENS.USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: TOKENS.REFRESH_TOKEN_REPOSITORY,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: TOKENS.JWT_TOKEN_SERVICE,
          useValue: mockTokenService,
        },
        {
          provide: TOKENS.BCRYPT_PASSWORD_SERVICE,
          useValue: mockPasswordService,
        },
        {
          provide: TOKENS.CACHE_SERVICE,
          useValue: mockCacheService,
        },
        {
          provide: TOKENS.PINO_LOGGER,
          useValue: mockLogger,
        },
        {
          provide: TOKENS.I18N_SERVICE,
          useValue: mockI18n,
        },
        {
          provide: TOKENS.APP_CONFIG,
          useValue: mockConfig,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  describe('User Caching after Login', () => {
    it('should cache user data in Redis after successful login', async () => {
      // Arrange
      const request = {
        email: 'user@example.com',
        password: 'validPassword123',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      const mockUser = {
        id: 'user-456',
        email: { value: 'user@example.com' },
        name: 'John Doe',
        role: 'USER',
        hashedPassword: 'hashedPassword',
      };

      const mockRefreshToken = {
        id: 'refresh-token-123',
        token:
          'refresh_token_456_with_minimum_32_characters_required_for_validation',
        userId: 'user-456',
        hashedToken: 'hashed_refresh_token',
        isRevoked: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('access_token_123');
      mockTokenService.generateRefreshToken.mockReturnValue(
        'refresh_token_456_with_minimum_32_characters_required_for_validation',
      );
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshToken);
      mockCacheService.set.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);

      // Vérifier que l'utilisateur a été mis en cache
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'connected_user:user-456',
        expect.stringContaining('"id":"user-456"'),
        1800, // 30 minutes * 60 seconds
      );

      // Vérifier que les données cachées sont correctes
      const [cacheKey, cacheData, ttl] = mockCacheService.set.mock.calls[0];
      const cachedUser = JSON.parse(cacheData);

      expect(cacheKey).toBe('connected_user:user-456');
      expect(ttl).toBe(1800); // 30 minutes en secondes
      expect(cachedUser).toEqual({
        id: 'user-456',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'USER',
        connectedAt: expect.any(String),
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      });

      // Vérifier que la connexion a été loggée
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Mock message',
        expect.objectContaining({
          userId: 'user-456',
          sessionDurationMinutes: 30,
          cacheKey: 'connected_user:user-456',
        }),
      );
    });

    it('should continue login even if caching fails', async () => {
      // Arrange
      const request = {
        email: 'user@example.com',
        password: 'validPassword123',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      const mockUser = {
        id: 'user-456',
        email: { value: 'user@example.com' },
        name: 'John Doe',
        role: 'USER',
        hashedPassword: 'hashedPassword',
      };

      const mockRefreshToken = {
        id: 'refresh-token-123',
        token:
          'refresh_token_456_with_minimum_32_characters_required_for_validation',
        userId: 'user-456',
        hashedToken: 'hashed_refresh_token',
        isRevoked: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('access_token_123');
      mockTokenService.generateRefreshToken.mockReturnValue(
        'refresh_token_456_with_minimum_32_characters_required_for_validation',
      );
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshToken);

      // Simuler une erreur de cache
      mockCacheService.set.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user.id).toBe('user-456');

      // Vérifier que l'erreur de cache a été loggée mais n'a pas fait échouer le login
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Mock message',
        expect.objectContaining({
          userId: 'user-456',
          error: 'Redis connection failed',
        }),
      );
    });

    it('should use configurable session duration from config service', async () => {
      // Arrange - Modifier la durée de session
      mockConfig.getUserSessionDurationMinutes.mockReturnValue(120); // 2 heures

      const request = {
        email: 'user@example.com',
        password: 'validPassword123',
      };

      const mockUser = {
        id: 'user-456',
        email: { value: 'user@example.com' },
        name: 'John Doe',
        role: 'USER',
        hashedPassword: 'hashedPassword',
      };

      const mockRefreshToken = {
        id: 'refresh-token-123',
        token:
          'refresh_token_456_with_minimum_32_characters_required_for_validation',
        userId: 'user-456',
        hashedToken: 'hashed_refresh_token',
        isRevoked: false,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('access_token_123');
      mockTokenService.generateRefreshToken.mockReturnValue(
        'refresh_token_456_with_minimum_32_characters_required_for_validation',
      );
      mockRefreshTokenRepository.save.mockResolvedValue(mockRefreshToken);
      mockCacheService.set.mockResolvedValue(undefined);

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'connected_user:user-456',
        expect.any(String),
        7200, // 120 minutes * 60 seconds = 2 heures
      );
    });
  });
});
