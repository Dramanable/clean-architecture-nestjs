/**
 * 🧪 TDD - Get User Use Case Tests
 *
 * Tests complets pour la récupération d'utilisateurs avec permissions
 */

import { User } from '../../../domain/entities/user.entity';
import {
  InsufficientPermissionsError,
  UserNotFoundError,
} from '../../../domain/exceptions/user.exceptions';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { MockI18nService } from '../../../infrastructure/i18n/i18n.service';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { Logger } from '../../ports/logger.port';
import { GetUserUseCase } from './get-user.use-case';

interface GetUserRequest {
  userId: string;
  requestingUserId: string;
}

describe('GetUserUseCase', () => {
  let getUserUseCase: GetUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: MockI18nService;

  beforeEach(() => {
    // Mock du repository
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as any;

    // Mock du logger
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn(),
    } as any;

    // Service i18n
    mockI18n = new MockI18nService();

    // Use case à tester
    getUserUseCase = new GetUserUseCase(
      mockUserRepository,
      mockLogger,
      mockI18n,
    );
  });

  describe('Successful User Retrieval', () => {
    it('should retrieve user when requesting own profile', async () => {
      // Arrange
      const request: GetUserRequest = {
        userId: 'user-123',
        requestingUserId: 'user-123', // Same user
      };

      const user = new User(
        new Email('user@company.com'),
        'Test User',
        UserRole.USER,
      );
      Object.defineProperty(user, 'id', { value: 'user-123' });

      mockUserRepository.findById.mockResolvedValue(user);

      // Act
      const result = await getUserUseCase.execute(request);

      // Assert
      expect(result).toEqual({
        id: 'user-123',
        email: 'user@company.com',
        name: 'Test User',
        role: UserRole.USER,
        passwordChangeRequired: false,
        createdAt: expect.any(Date),
        updatedAt: undefined,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('retrieved successfully'),
        expect.any(Object),
      );
      expect(mockLogger.audit).toHaveBeenCalled();
    });

    it('should allow super admin to view any user', async () => {
      // Arrange
      const request: GetUserRequest = {
        userId: 'target-user',
        requestingUserId: 'admin-id',
      };

      const admin = new User(
        new Email('admin@company.com'),
        'Admin',
        UserRole.SUPER_ADMIN,
      );
      Object.defineProperty(admin, 'id', { value: 'admin-id' });

      const targetUser = new User(
        new Email('target@company.com'),
        'Target User',
        UserRole.MANAGER,
      );
      Object.defineProperty(targetUser, 'id', { value: 'target-user' });

      mockUserRepository.findById
        .mockResolvedValueOnce(admin)
        .mockResolvedValueOnce(targetUser);

      // Act
      const result = await getUserUseCase.execute(request);

      // Assert
      expect(result.email).toBe('target@company.com');
      expect(result.role).toBe(UserRole.MANAGER);
    });

    it('should allow manager to view regular users', async () => {
      // Arrange
      const request: GetUserRequest = {
        userId: 'user-id',
        requestingUserId: 'manager-id',
      };

      const manager = new User(
        new Email('manager@company.com'),
        'Manager',
        UserRole.MANAGER,
      );
      Object.defineProperty(manager, 'id', { value: 'manager-id' });

      const regularUser = new User(
        new Email('user@company.com'),
        'User',
        UserRole.USER,
      );
      Object.defineProperty(regularUser, 'id', { value: 'user-id' });

      mockUserRepository.findById
        .mockResolvedValueOnce(manager)
        .mockResolvedValueOnce(regularUser);

      // Act
      const result = await getUserUseCase.execute(request);

      // Assert
      expect(result.email).toBe('user@company.com');
    });
  });

  describe('Authorization Rules', () => {
    it('should reject when regular user tries to view others', async () => {
      // Arrange
      const request: GetUserRequest = {
        userId: 'other-user',
        requestingUserId: 'user-id',
      };

      const regularUser = new User(
        new Email('user@company.com'),
        'User',
        UserRole.USER,
      );
      Object.defineProperty(regularUser, 'id', { value: 'user-id' });

      const otherUser = new User(
        new Email('other@company.com'),
        'Other User',
        UserRole.USER,
      );
      Object.defineProperty(otherUser, 'id', { value: 'other-user' });

      mockUserRepository.findById
        .mockResolvedValueOnce(regularUser)
        .mockResolvedValueOnce(otherUser);

      // Act & Assert
      await expect(getUserUseCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Permission denied'),
        expect.any(Object),
      );
    });

    it('should reject when manager tries to view admin', async () => {
      // Arrange
      const request: GetUserRequest = {
        userId: 'admin-id',
        requestingUserId: 'manager-id',
      };

      const manager = new User(
        new Email('manager@company.com'),
        'Manager',
        UserRole.MANAGER,
      );
      Object.defineProperty(manager, 'id', { value: 'manager-id' });

      const admin = new User(
        new Email('admin@company.com'),
        'Admin',
        UserRole.SUPER_ADMIN,
      );
      Object.defineProperty(admin, 'id', { value: 'admin-id' });

      mockUserRepository.findById
        .mockResolvedValueOnce(manager)
        .mockResolvedValueOnce(admin);

      // Act & Assert
      await expect(getUserUseCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('cannot access admin'),
        expect.any(Object),
      );
    });
  });

  describe('Business Rules Validation', () => {
    it('should reject when requesting user not found', async () => {
      // Arrange
      const request: GetUserRequest = {
        userId: 'target-user',
        requestingUserId: 'invalid-id',
      };

      mockUserRepository.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(getUserUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('requesting user not found'),
        expect.any(Object),
      );
    });

    it('should reject when target user not found', async () => {
      // Arrange
      const request: GetUserRequest = {
        userId: 'invalid-target',
        requestingUserId: 'admin-id',
      };

      const admin = new User(
        new Email('admin@company.com'),
        'Admin',
        UserRole.SUPER_ADMIN,
      );
      Object.defineProperty(admin, 'id', { value: 'admin-id' });

      mockUserRepository.findById
        .mockResolvedValueOnce(admin)
        .mockResolvedValueOnce(null);

      // Act & Assert
      await expect(getUserUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Target user invalid-target not found'),
        expect.any(Object),
      );
    });
  });

  describe('Logging and Audit', () => {
    it('should log retrieval attempt and success', async () => {
      // Arrange
      const request: GetUserRequest = {
        userId: 'user-123',
        requestingUserId: 'user-123',
      };

      const user = new User(
        new Email('user@company.com'),
        'Test User',
        UserRole.USER,
      );
      Object.defineProperty(user, 'id', { value: 'user-123' });

      mockUserRepository.findById.mockResolvedValue(user);

      // Act
      await getUserUseCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Attempting to retrieve user'),
        expect.any(Object),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('retrieved successfully'),
        expect.any(Object),
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'User profile accessed',
        'user-123',
        expect.any(Object),
      );
    });

    it('should log errors with context', async () => {
      // Arrange
      const request: GetUserRequest = {
        userId: 'target-user',
        requestingUserId: 'invalid-id',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(getUserUseCase.execute(request)).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Operation GetUser failed'),
        expect.any(Error),
        expect.objectContaining({
          operation: 'GetUser',
          requestingUserId: 'invalid-id',
          targetUserId: 'target-user',
          duration: expect.any(Number),
        }),
      );
    });
  });
});
