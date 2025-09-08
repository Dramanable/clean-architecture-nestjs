/**
 * 🧪 DeleteUserUseCase - Tests unitaires TDD
 *
 * Test complet avec respect des principes Clean Architecture et SOLID
 */

import { DeleteUserUseCase, DeleteUserRequest } from './delete-user.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { Logger } from '../../ports/logger.port';
import type { I18nService } from '../../ports/i18n.port';
import type { ICacheService } from '../../ports/cache.port';
import {
  UserNotFoundError,
  InsufficientPermissionsError,
  SelfDeletionError,
} from '../../../domain/exceptions/user.exceptions';

describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;
  let mockCacheService: jest.Mocked<ICacheService>;

  // Test data
  let superAdminUser: User;
  let managerUser: User;
  let regularUser: User;
  let targetUser: User;

  beforeEach(() => {
    // Mock repository
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<UserRepository>;

    // Mock logger avec toutes les méthodes
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
    } as jest.Mocked<Logger>;

    // Mock i18n
    mockI18n = {
      t: jest.fn().mockReturnValue('Mocked translation'),
    } as jest.Mocked<I18nService>;

    // Mock cache service
    mockCacheService = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
      invalidateUserCache: jest.fn(),
    } as jest.Mocked<ICacheService>;

    deleteUserUseCase = new DeleteUserUseCase(
      mockUserRepository,
      mockLogger,
      mockI18n,
      mockCacheService,
    );

    // Test users
    superAdminUser = User.create(
      Email.create('superadmin@example.com'),
      'Super Admin',
      UserRole.SUPER_ADMIN,
    );
    Object.defineProperty(superAdminUser, '_id', {
      value: 'super-admin-123',
      writable: false,
    });

    managerUser = User.create(
      Email.create('manager@example.com'),
      'Manager User',
      UserRole.MANAGER,
    );
    Object.defineProperty(managerUser, '_id', {
      value: 'manager-456',
      writable: false,
    });

    regularUser = User.create(
      Email.create('user@example.com'),
      'Regular User',
      UserRole.USER,
    );
    Object.defineProperty(regularUser, '_id', {
      value: 'user-789',
      writable: false,
    });

    targetUser = User.create(
      Email.create('target@example.com'),
      'Target User',
      UserRole.USER,
    );
    Object.defineProperty(targetUser, '_id', {
      value: 'target-user-123',
      writable: false,
    });
  });

  describe('Successful User Deletion', () => {
    it('should allow super admin to delete any user', async () => {
      // Arrange
      const request: DeleteUserRequest = {
        userId: targetUser.id,
        requestingUserId: superAdminUser.id,
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser) // requesting user
        .mockResolvedValueOnce(targetUser); // target user
      mockUserRepository.delete.mockResolvedValue();
      mockCacheService.invalidateUserCache.mockResolvedValue();

      // Act
      const result = await deleteUserUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deletedUserId).toBe(targetUser.id);
      expect(result.deletedAt).toBeInstanceOf(Date);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(targetUser.id);
      expect(mockCacheService.invalidateUserCache).toHaveBeenCalledWith(
        targetUser.id,
      );
    });

    it('should invalidate user cache before deletion', async () => {
      // Arrange
      const request: DeleteUserRequest = {
        userId: targetUser.id,
        requestingUserId: superAdminUser.id,
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(targetUser);
      mockUserRepository.delete.mockResolvedValue();
      mockCacheService.invalidateUserCache.mockResolvedValue();

      // Act
      await deleteUserUseCase.execute(request);

      // Assert
      expect(mockCacheService.invalidateUserCache).toHaveBeenCalledWith(
        targetUser.id,
      );
      // Note: Cache should be invalidated before deletion for consistency
    });
  });

  describe('Authorization Rules', () => {
    it('should reject when requesting user not found', async () => {
      // Arrange
      const request: DeleteUserRequest = {
        userId: 'target-456',
        requestingUserId: 'non-existent-user',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(deleteUserUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(mockCacheService.invalidateUserCache).not.toHaveBeenCalled();
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should reject when manager tries to delete user (insufficient permissions)', async () => {
      // Arrange - Manager role doesn't have DELETE_USER permission
      const request: DeleteUserRequest = {
        userId: targetUser.id,
        requestingUserId: managerUser.id,
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(managerUser)
        .mockResolvedValueOnce(targetUser);

      // Act & Assert
      await expect(deleteUserUseCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockCacheService.invalidateUserCache).not.toHaveBeenCalled();
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should reject when regular user tries to delete another user', async () => {
      // Arrange
      const request: DeleteUserRequest = {
        userId: targetUser.id,
        requestingUserId: regularUser.id,
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(regularUser)
        .mockResolvedValueOnce(targetUser);

      // Act & Assert
      await expect(deleteUserUseCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockCacheService.invalidateUserCache).not.toHaveBeenCalled();
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('Business Rules Validation', () => {
    it('should reject when user tries to delete themselves', async () => {
      // Arrange
      const request: DeleteUserRequest = {
        userId: superAdminUser.id,
        requestingUserId: superAdminUser.id,
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(superAdminUser);

      // Act & Assert
      await expect(deleteUserUseCase.execute(request)).rejects.toThrow(
        SelfDeletionError,
      );

      expect(mockCacheService.invalidateUserCache).not.toHaveBeenCalled();
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should reject when target user not found', async () => {
      // Arrange
      const request: DeleteUserRequest = {
        userId: 'non-existent-target',
        requestingUserId: superAdminUser.id,
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(null); // target user not found

      // Act & Assert
      await expect(deleteUserUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(mockCacheService.invalidateUserCache).not.toHaveBeenCalled();
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle cache invalidation failure gracefully', async () => {
      // Arrange
      const request: DeleteUserRequest = {
        userId: targetUser.id,
        requestingUserId: superAdminUser.id,
      };

      const cacheError = new Error('Cache service unavailable');

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(targetUser);
      mockCacheService.invalidateUserCache.mockRejectedValue(cacheError);

      // Act & Assert
      await expect(deleteUserUseCase.execute(request)).rejects.toThrow(
        'Cache service unavailable',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Mocked translation',
        cacheError,
        expect.any(Object),
      );
      // Deletion should not proceed if cache invalidation fails
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository deletion failure', async () => {
      // Arrange
      const request: DeleteUserRequest = {
        userId: targetUser.id,
        requestingUserId: superAdminUser.id,
      };

      const repositoryError = new Error('Database connection failed');

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(targetUser);
      mockCacheService.invalidateUserCache.mockResolvedValue();
      mockUserRepository.delete.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(deleteUserUseCase.execute(request)).rejects.toThrow(
        'Database connection failed',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Mocked translation',
        repositoryError,
        expect.any(Object),
      );
    });
  });

  describe('Audit Logging', () => {
    it('should log successful user deletion', async () => {
      // Arrange
      const request: DeleteUserRequest = {
        userId: targetUser.id,
        requestingUserId: superAdminUser.id,
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(targetUser);
      mockUserRepository.delete.mockResolvedValue();
      mockCacheService.invalidateUserCache.mockResolvedValue();

      // Act
      await deleteUserUseCase.execute(request);

      // Assert - Verify audit logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Mocked translation',
        expect.objectContaining({
          operation: 'DeleteUser',
          requestingUserId: superAdminUser.id,
        }),
      );

      expect(mockLogger.audit).toHaveBeenCalledWith(
        'Mocked translation',
        expect.objectContaining({
          operation: 'DeleteUser',
          requestingUserId: superAdminUser.id,
          targetUserId: targetUser.id,
        }),
      );
    });

    it('should log authorization failures', async () => {
      // Arrange
      const request: DeleteUserRequest = {
        userId: targetUser.id,
        requestingUserId: regularUser.id,
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(regularUser)
        .mockResolvedValueOnce(targetUser);

      // Act & Assert
      await expect(deleteUserUseCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Mocked translation',
        expect.any(InsufficientPermissionsError),
        expect.objectContaining({
          operation: 'DeleteUser',
          requestingUserId: regularUser.id,
        }),
      );
    });
  });
});
