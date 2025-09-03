/**
 * 🧪 RefreshTokenUseCase - TDD RED Phase
 *
 * Tests avant implémentation pour refresh token workflow
 */

import { Test, TestingModule } from '@nestjs/testing';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import {
  InvalidRefreshTokenError,
  TokenExpiredError,
  UserNotFoundError,
} from '../../exceptions/auth.exceptions';
import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase (TDD)', () => {
  let useCase: RefreshTokenUseCase;
  let mockRefreshTokenRepository: any;
  let mockUserRepository: any;
  let mockTokenService: any;
  let mockLogger: any;
  let mockI18n: any;
  let mockConfig: any;

  beforeEach(async () => {
    mockRefreshTokenRepository = {
      findByToken: jest.fn(),
      save: jest.fn(),
      revokeAllByUserId: jest.fn(),
    };

    mockUserRepository = {
      findById: jest.fn(),
    };

    mockTokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
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
      getAccessTokenSecret: jest.fn().mockReturnValue('test-secret'),
      getAccessTokenExpirationTime: jest.fn().mockReturnValue(900),
      getRefreshTokenSecret: jest.fn().mockReturnValue('refresh-secret'),
      getRefreshTokenExpirationDays: jest.fn().mockReturnValue(7),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: TOKENS.REFRESH_TOKEN_REPOSITORY,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: TOKENS.USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: TOKENS.TOKEN_SERVICE,
          useValue: mockTokenService,
        },
        {
          provide: TOKENS.LOGGER,
          useValue: mockLogger,
        },
        {
          provide: TOKENS.I18N_SERVICE,
          useValue: mockI18n,
        },
        {
          provide: TOKENS.CONFIG_SERVICE,
          useValue: mockConfig,
        },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
  });

  describe('Successful Token Refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Arrange
      const request = {
        refreshToken: 'valid_refresh_token',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      const mockStoredToken = {
        id: 'token-123',
        userId: 'user-456',
        isValid: () => true,
        isExpired: () => false,
        revoke: jest.fn(),
      };

      const mockUser = {
        id: 'user-456',
        email: { value: 'user@example.com' }, // Mock du Value Object Email
        name: 'John Doe',
        role: 'USER',
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockStoredToken);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockTokenService.generateAccessToken.mockReturnValue('new_access_token');
      mockTokenService.generateRefreshToken.mockReturnValue(
        'new_refresh_token',
      );

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.tokens.accessToken).toBe('new_access_token');
      expect(result.tokens.refreshToken).toBe('new_refresh_token');
      expect(result.user.id).toBe('user-456');
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(
        request.refreshToken,
      );
      expect(mockStoredToken.revoke).toHaveBeenCalled();
    });

    it('should rotate refresh token for security', async () => {
      // Arrange
      const request = {
        refreshToken: 'valid_refresh_token',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      const mockStoredToken = {
        userId: 'user-456',
        isValid: () => true,
        isExpired: () => false,
        revoke: jest.fn(),
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockStoredToken);
      mockUserRepository.findById.mockResolvedValue({
        id: 'user-456',
        email: { value: 'user@example.com' }, // Mock du Value Object Email
        name: 'John Doe',
        role: 'USER',
      });

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockStoredToken.revoke).toHaveBeenCalled();
      expect(mockRefreshTokenRepository.save).toHaveBeenCalled();
    });
  });

  describe('Security Validations', () => {
    it('should reject invalid refresh token', async () => {
      // Arrange
      const request = {
        refreshToken: 'invalid_token',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        InvalidRefreshTokenError,
      );
    });

    it('should reject expired refresh token', async () => {
      // Arrange
      const request = {
        refreshToken: 'expired_token',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      const mockExpiredToken = {
        userId: 'user-456',
        isValid: () => true, // Le token existe et est techniquement valide
        isExpired: () => true, // Mais il est expiré
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(
        mockExpiredToken,
      );

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(TokenExpiredError);
    });

    it('should reject when user not found', async () => {
      // Arrange
      const request = {
        refreshToken: 'valid_token',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
      };

      const mockToken = {
        userId: 'non-existent-user',
        isValid: () => true,
        isExpired: () => false,
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockToken);
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(UserNotFoundError);
    });
  });
});
