/**
 * 🧪 LogoutUseCase - TDD RED Phase
 *
 * Tests avant implémentation pour logout workflow
 */

import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUseCase } from './logout.use-case';
import { TOKENS } from '../../../shared/constants/injection-tokens';

describe('LogoutUseCase (TDD)', () => {
  let useCase: LogoutUseCase;
  let mockRefreshTokenRepository: any;
  let mockLogger: any;
  let mockI18n: any;

  beforeEach(async () => {
    mockRefreshTokenRepository = {
      findByToken: jest.fn(),
      revokeAllByUserId: jest.fn(),
      revokeByToken: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    mockI18n = {
      t: jest.fn().mockReturnValue('Mock message'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        {
          provide: TOKENS.REFRESH_TOKEN_REPOSITORY,
          useValue: mockRefreshTokenRepository,
        },
        {
          provide: TOKENS.LOGGER,
          useValue: mockLogger,
        },
        {
          provide: TOKENS.I18N_SERVICE,
          useValue: mockI18n,
        },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
  });

  describe('Single Device Logout', () => {
    it('should logout from current device only', async () => {
      // Arrange
      const request = {
        refreshToken: 'valid_refresh_token',
        logoutAll: false,
      };

      const mockToken = {
        id: 'token-123',
        userId: 'user-456',
        isValid: () => true,
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Mock message');
      expect(mockRefreshTokenRepository.findByToken).toHaveBeenCalledWith(request.refreshToken);
      expect(mockRefreshTokenRepository.revokeByToken).toHaveBeenCalledWith(request.refreshToken);
      expect(mockRefreshTokenRepository.revokeAllByUserId).not.toHaveBeenCalled();
    });
  });

  describe('All Devices Logout', () => {
    it('should logout from all devices when logoutAll is true', async () => {
      // Arrange
      const request = {
        refreshToken: 'valid_refresh_token',
        logoutAll: true,
      };

      const mockToken = {
        id: 'token-123',
        userId: 'user-456',
        isValid: () => true,
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockToken);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith('user-456');
      expect(mockRefreshTokenRepository.revokeByToken).not.toHaveBeenCalled();
    });

    it('should handle logout all even without valid token', async () => {
      // Arrange
      const request = {
        refreshToken: 'invalid_token',
        logoutAll: true,
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Mock message');
    });
  });

  describe('Security Edge Cases', () => {
    it('should succeed even with invalid token (security)', async () => {
      // Arrange
      const request = {
        refreshToken: 'invalid_token',
        logoutAll: false,
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Mock message');
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const request = {
        refreshToken: 'valid_token',
        logoutAll: false,
      };

      mockRefreshTokenRepository.findByToken.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Audit Logging', () => {
    it('should log successful logout operation', async () => {
      // Arrange
      const request = {
        refreshToken: 'valid_refresh_token',
        logoutAll: false,
      };

      const mockToken = {
        userId: 'user-456',
        isValid: () => true,
      };

      mockRefreshTokenRepository.findByToken.mockResolvedValue(mockToken);

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          operation: 'LOGOUT',
          result: 'success',
          userId: 'user-456',
        }),
      );
    });
  });
});
