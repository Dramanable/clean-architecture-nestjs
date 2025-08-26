/**
 * 🧪 TDD - Update User Use Case
 *
 * Tests pour la modification d'utilisateurs avec règles métier strictes
 */

import { User } from '../../../domain/entities/user.entity';
import {
  EmailAlreadyExistsError,
  InsufficientPermissionsError,
  InvalidEmailFormatError,
  InvalidNameError,
  RoleElevationError,
  UserNotFoundError,
} from '../../../domain/exceptions/user.exceptions';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { MockI18nService } from '../../mocks/mock-i18n.service';
import { Logger } from '../../ports/logger.port';
import { UpdateUserUseCase } from './update-user.use-case';

// DTOs
interface UpdateUserRequest {
  userId: string;
  email?: string;
  name?: string;
  role?: UserRole;
  requestingUserId: string;
}

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: MockI18nService;
  let superAdminUser: User;
  let managerUser: User;
  let regularUser: User;
  let targetUser: User;

  beforeEach(() => {
    // Mock du repository
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
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

    // Mock i18n
    mockI18n = new MockI18nService();

    // Use case à tester
    updateUserUseCase = new UpdateUserUseCase(
      mockUserRepository,
      mockLogger,
      mockI18n,
    );

    // Utilisateurs de test
    superAdminUser = new User(
      new Email('admin@company.com'),
      'Super Admin',
      UserRole.SUPER_ADMIN,
    );
    (superAdminUser as any).id = 'admin-id';

    managerUser = new User(
      new Email('manager@company.com'),
      'Manager User',
      UserRole.MANAGER,
    );
    (managerUser as any).id = 'manager-id';

    regularUser = new User(
      new Email('user@company.com'),
      'Regular User',
      UserRole.USER,
    );
    (regularUser as any).id = 'user-id';

    targetUser = new User(
      new Email('target@company.com'),
      'Target User',
      UserRole.USER,
    );
    (targetUser as any).id = 'target-id';
  });

  describe('Successful User Updates', () => {
    it('should update user name when super admin updates any user', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id',
        name: 'Updated Name',
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser) // requesting user
        .mockResolvedValueOnce(targetUser); // target user

      const updatedUser = new User(
        targetUser.email,
        'Updated Name',
        targetUser.role,
      );
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result.name).toBe('Updated Name');
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Name',
          email: targetUser.email,
          role: targetUser.role,
        }),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('success.user.update_success'), // Clé i18n
        expect.any(Object),
      );
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'audit.user.updated', // Clé i18n
        'admin-id',
        expect.any(Object),
      );
    });

    it('should update user email when valid and unique', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id',
        email: 'newemail@company.com',
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(targetUser);
      mockUserRepository.findByEmail.mockResolvedValue(null); // Email available

      const updatedUser = new User(
        new Email('newemail@company.com'),
        targetUser.name,
        targetUser.role,
      );
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result.email).toBe('newemail@company.com');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        new Email('newemail@company.com'),
      );
    });

    it('should allow regular user to update their own profile', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'user-id',
        name: 'Updated Self',
        requestingUserId: 'user-id', // Same user
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(regularUser)
        .mockResolvedValueOnce(regularUser);

      const updatedUser = new User(
        regularUser.email,
        'Updated Self',
        regularUser.role,
      );
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result.name).toBe('Updated Self');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should allow manager to update team members', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id',
        name: 'Updated by Manager',
        requestingUserId: 'manager-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(managerUser)
        .mockResolvedValueOnce(targetUser);

      const updatedUser = new User(
        targetUser.email,
        'Updated by Manager',
        targetUser.role,
      );
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result.name).toBe('Updated by Manager');
    });
  });

  describe('Role Update Authorization', () => {
    it('should allow super admin to change any role', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id',
        role: UserRole.MANAGER,
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(targetUser);

      const updatedUser = new User(
        targetUser.email,
        targetUser.name,
        UserRole.MANAGER,
      );
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result.role).toBe(UserRole.MANAGER);
    });

    it('should reject manager trying to promote user to admin', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id',
        role: UserRole.SUPER_ADMIN,
        requestingUserId: 'manager-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(managerUser)
        .mockResolvedValueOnce(targetUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        RoleElevationError,
      );

      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should reject regular user trying to change roles', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'user-id', // Self
        role: UserRole.MANAGER,
        requestingUserId: 'user-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(regularUser)
        .mockResolvedValueOnce(regularUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Business Rules Validation', () => {
    it('should reject when requesting user not found', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id',
        name: 'New Name',
        requestingUserId: 'invalid-id',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );
    });

    it('should reject when target user not found', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'invalid-target-id',
        name: 'New Name',
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(null); // Target not found

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );
    });

    it('should reject when email already exists', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id',
        email: 'existing@company.com',
        requestingUserId: 'admin-id',
      };

      const existingUser = new User(
        new Email('existing@company.com'),
        'Existing User',
        UserRole.USER,
      );

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(targetUser);
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        EmailAlreadyExistsError,
      );

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should reject invalid email format', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id',
        email: 'invalid-email',
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(targetUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        InvalidEmailFormatError,
      );
    });

    it('should reject empty name', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id',
        name: '   ',
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(targetUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        InvalidNameError,
      );
    });

    it('should reject when regular user tries to update others', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id', // Different user
        name: 'Hacked Name',
        requestingUserId: 'user-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(regularUser)
        .mockResolvedValueOnce(targetUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Data Sanitization', () => {
    it('should normalize email and name', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id',
        email: '  NewEmail@Company.COM  ',
        name: '  Updated Name  ',
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(targetUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const updatedUser = new User(
        new Email('newemail@company.com'),
        'Updated Name',
        targetUser.role,
      );
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result.email).toBe('newemail@company.com');
      expect(result.name).toBe('Updated Name');
    });

    it('should handle partial updates (only name)', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        userId: 'target-id',
        name: 'Only Name Update',
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(superAdminUser)
        .mockResolvedValueOnce(targetUser);

      const updatedUser = new User(
        targetUser.email,
        'Only Name Update',
        targetUser.role,
      );
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result.name).toBe('Only Name Update');
      expect(result.email).toBe(targetUser.email.value); // Unchanged
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Only Name Update',
          email: targetUser.email,
          role: targetUser.role,
        }),
      );
    });
  });
});
