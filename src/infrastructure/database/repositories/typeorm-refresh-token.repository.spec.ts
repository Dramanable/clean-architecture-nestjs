/**
 * 🧪 TypeOrmRefreshTokenRepository - TDD RED Phase
 *
 * Tests avant implémentation pour refresh token repository
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import { RefreshToken as DomainRefreshToken } from '../../../domain/entities/refresh-token.entity';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import { RefreshTokenOrmEntity } from '../entities/typeorm/refresh-token.entity';
import { TypeOrmRefreshTokenRepository } from './typeorm-refresh-token.repository';

describe('TypeOrmRefreshTokenRepository (TDD)', () => {
  let repository: TypeOrmRefreshTokenRepository;
  let mockTypeOrmRepository: Partial<Repository<RefreshTokenOrmEntity>>;
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
          provide: getRepositoryToken(RefreshTokenOrmEntity),
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

    repository = module.get<TypeOrmRefreshTokenRepository>(
      TypeOrmRefreshTokenRepository,
    );
  });

  describe('Token Lookup', () => {
    it('should find refresh token by token string', async () => {
      // Arrange
      const tokenString = 'refresh_token_123';

      // Simuler la méthode hashToken pour obtenir le hash attendu
      let hash = 0;
      for (let i = 0; i < tokenString.length; i++) {
        const char = tokenString.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      const expectedTokenHash = `hash_${Math.abs(hash).toString(16)}`;

      const mockEntity = {
        id: 'token-id-456',
        tokenHash: expectedTokenHash,
        userId: 'user-789',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 86400000), // 1 day
        deviceId: 'device-123',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        revokedAt: null,
        createdAt: new Date(),
      };

      mockTypeOrmRepository.findOne = jest.fn().mockResolvedValue(mockEntity);

      // Act
      const result = await repository.findByToken(tokenString);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeTruthy();
      expect((result as any).userId).toBe('user-789');
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { tokenHash: expectedTokenHash },
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
      const refreshTokenEntity = new DomainRefreshToken(
        'user-123',
        'new_refresh_token_raw_with_sufficient_length_32chars_minimum',
        new Date(Date.now() + 604800000), // 7 days
        undefined, // deviceId
        'Mozilla/5.0',
        '192.168.1.1',
      );

      const savedEntity = {
        id: 'token-id-new',
        tokenHash: refreshTokenEntity.tokenHash,
        userId: refreshTokenEntity.userId,
        userAgent: refreshTokenEntity.userAgent,
        ipAddress: refreshTokenEntity.ipAddress,
        expiresAt: refreshTokenEntity.expiresAt,
        isRevoked: false,
        createdAt: new Date(),
      };

      mockTypeOrmRepository.save = jest.fn().mockResolvedValue(savedEntity);

      // Act
      const result = await repository.save(refreshTokenEntity);

      // Assert
      expect(result).toBeDefined();
      expect(result.tokenHash).toBe(refreshTokenEntity.tokenHash);
      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          tokenHash: refreshTokenEntity.tokenHash,
          userId: refreshTokenEntity.userId,
        }),
      );
    });
  });

  describe('Token Revocation', () => {
    it('should revoke all tokens by user ID', async () => {
      // Arrange
      const userId = 'user-456';
      mockTypeOrmRepository.update = jest
        .fn()
        .mockResolvedValue({ affected: 3 });

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
      mockTypeOrmRepository.update = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

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
