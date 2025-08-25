/**
 * 🧪 TypeOrmRefreshTokenRepository - TDD RED Phase
 *
 * Tests avant implémentation pour refresh token repository
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmRefreshTokenRepository } from './typeorm-refresh-token.repository';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { TOKENS } from '../../../shared/constants/injection-tokens';

describe('TypeOrmRefreshTokenRepository (TDD)', () => {
  let repository: TypeOrmRefreshTokenRepository;
  let mockTypeOrmRepository: Partial<Repository<RefreshTokenEntity>>;
  let mockLogger: any;
  let mockI18n: any;

  beforeEach(async () => {
    mockTypeOrmRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      find: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    mockI18n = {
      t: jest.fn().mockReturnValue('Mock message'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmRefreshTokenRepository,
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useValue: mockTypeOrmRepository,
        },
        {
          provide: TOKENS.PINO_LOGGER,
          useValue: mockLogger,
        },
        {
          provide: TOKENS.I18N_SERVICE,
          useValue: mockI18n,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmRefreshTokenRepository>(TypeOrmRefreshTokenRepository);
  });

  describe('Token Lookup', () => {
    it('should find refresh token by token string', async () => {
      // Arrange
      const tokenString = 'refresh_token_123';
      const mockEntity = {
        id: 'token-id-456',
        token: tokenString,
        userId: 'user-789',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000), // 1 day
        isValid: () => true,
        isExpired: () => false,
        revoke: jest.fn(),
      };

      mockTypeOrmRepository.findOne = jest.fn().mockResolvedValue(mockEntity);

      // Act
      const result = await repository.findByToken(tokenString);

      // Assert
      expect(result).toBeDefined();
      expect(result.token).toBe(tokenString);
      expect(result.userId).toBe('user-789');
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { token: tokenString },
      });
    });

    it('should return null when token not found', async () => {
      // Arrange
      const tokenString = 'non_existent_token';
      mockTypeOrmRepository.findOne = jest.fn().mockResolvedValue(null);

      // Act
      const result = await repository.findByToken(tokenString);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Token Persistence', () => {
    it('should save refresh token successfully', async () => {
      // Arrange
      const refreshTokenData = {
        token: 'new_refresh_token',
        userId: 'user-123',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        expiresAt: new Date(Date.now() + 604800000), // 7 days
      };

      const savedEntity = {
        id: 'token-id-new',
        ...refreshTokenData,
        isRevoked: false,
        createdAt: new Date(),
      };

      mockTypeOrmRepository.save = jest.fn().mockResolvedValue(savedEntity);

      // Act
      const result = await repository.save(refreshTokenData);

      // Assert
      expect(result).toBeDefined();
      expect(result.token).toBe(refreshTokenData.token);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          token: refreshTokenData.token,
          userId: refreshTokenData.userId,
        }),
      );
    });
  });

  describe('Token Revocation', () => {
    it('should revoke all tokens by user ID', async () => {
      // Arrange
      const userId = 'user-456';
      mockTypeOrmRepository.update = jest.fn().mockResolvedValue({ affected: 3 });

      // Act
      await repository.revokeAllByUserId(userId);

      // Assert
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith(
        { userId, isRevoked: false },
        { isRevoked: true, revokedAt: expect.any(Date) },
      );
    });

    it('should handle revocation errors gracefully', async () => {
      // Arrange
      const userId = 'user-456';
      mockTypeOrmRepository.update = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(repository.revokeAllByUserId(userId)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors with proper logging', async () => {
      // Arrange
      const tokenString = 'test_token';
      const dbError = new Error('Database connection failed');
      mockTypeOrmRepository.findOne = jest.fn().mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.findByToken(tokenString)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
