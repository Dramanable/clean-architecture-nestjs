/**
 * 🧪 LoginUseCase - TDD RED Phase
 *
 * Tests avant implémentation pour login workflow
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import {
  InvalidCredentialsError,
  TokenRepositoryError,
} from '../../exceptions/auth.exceptions';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase (TDD)', () => {
  let useCase: LoginUseCase;
  let mockUserRepository: any;
  let mockRefreshTokenRepository: any;
  let mockTokenService: any;
  let mockPasswordService: any;
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

  describe('Successful Login', () => {
    it('should authenticate user with valid credentials', async () => {
      // Arrange
      const request = {
        email: 'user@example.com',
        password: 'validPassword123',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      const mockUser = {
        id: 'user-456',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'USER',
        passwordHash: 'hashedPassword',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('access_token_123');
      mockTokenService.generateRefreshToken.mockReturnValue(
        'refresh_token_456',
      );
      mockRefreshTokenRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user.id).toBe('user-456');
      expect(result.tokens.accessToken).toBe('access_token_123');
      expect(result.tokens.refreshToken).toBe('refresh_token_456');
      expect(mockPasswordService.compare).toHaveBeenCalledWith(
        'validPassword123',
        'hashedPassword',
      );
      expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
    });

    it('should revoke old refresh tokens on login', async () => {
      // Arrange
      const request = {
        email: 'user@example.com',
        password: 'validPassword123',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      const mockUser = {
        id: 'user-456',
        email: 'user@example.com',
        passwordHash: 'hashedPassword',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('access_token');
      mockTokenService.generateRefreshToken.mockReturnValue('refresh_token');

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(
        'user-456',
      );
    });
  });

  describe('Authentication Failures', () => {
    it('should reject when user not found', async () => {
      // Arrange
      const request = {
        email: 'unknown@example.com',
        password: 'anyPassword',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        InvalidCredentialsError,
      );
    });

    it('should reject when password is invalid', async () => {
      // Arrange
      const request = {
        email: 'user@example.com',
        password: 'wrongPassword',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      const mockUser = {
        id: 'user-456',
        email: 'user@example.com',
        passwordHash: 'hashedPassword',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        InvalidCredentialsError,
      );
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const request = {
        email: 'user@example.com',
        password: 'validPassword',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      mockUserRepository.findByEmail.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        TokenRepositoryError,
      );
    });
  });

  describe('Security Auditing', () => {
    it('should log login attempts with context', async () => {
      // Arrange
      const request = {
        email: 'user@example.com',
        password: 'validPassword',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      const mockUser = {
        id: 'user-456',
        email: 'user@example.com',
        passwordHash: 'hashedPassword',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('access_token');
      mockTokenService.generateRefreshToken.mockReturnValue('refresh_token');

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          operation: 'LOGIN',
          result: 'success',
          userId: 'user-456',
        }),
      );
    });
  });
});
