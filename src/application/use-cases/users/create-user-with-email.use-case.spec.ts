/**
 * 🧪 TDD GREEN - Create User Use Case avec Email
 *
 * Tests pour l'implémentation des services email et password
 * Phase GREEN : Les tests doivent passer avec l'implémentation
 */

import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { IEmailService } from '../../ports/email.port';
import type { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
import { IPasswordGenerator } from '../../ports/password-generator.port';
import { CreateUserWithEmailUseCase } from './create-user-with-email.use-case';

// DTOs pour les tests
interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
  requestingUserId: string;
}

describe('CreateUserWithEmailUseCase - GREEN Phase (Implementation)', () => {
  let useCase: CreateUserWithEmailUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;
  let mockEmailService: jest.Mocked<IEmailService>;
  let mockPasswordGenerator: jest.Mocked<IPasswordGenerator>;

  // Test users
  let superAdmin: User;

  beforeEach(() => {
    // Mock repository
    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
      findByRole: jest.fn(),
      emailExists: jest.fn(),
      countSuperAdmins: jest.fn(),
      count: jest.fn(),
      countWithFilters: jest.fn(),
      update: jest.fn(),
      updateBatch: jest.fn(),
      deleteBatch: jest.fn(),
      export: jest.fn(),
    };

    // Mock logger
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };

    // Mock i18n
    mockI18n = {
      translate: jest.fn().mockImplementation((key: string) => key),
      t: jest.fn().mockImplementation((key: string) => key),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    };

    // Mock email service
    mockEmailService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      sendNotificationEmail: jest.fn().mockResolvedValue(undefined),
    };

    // Mock password generator
    mockPasswordGenerator = {
      generateTemporaryPassword: jest.fn().mockResolvedValue('TempPass123!'),
      generateResetToken: jest.fn().mockResolvedValue('reset-token-123'),
      validatePasswordStrength: jest.fn().mockResolvedValue({
        isValid: true,
        score: 4,
        feedback: [],
      }),
    };

    // Use case avec tous les services
    useCase = new CreateUserWithEmailUseCase(
      mockUserRepository,
      mockLogger,
      mockI18n,
      mockEmailService,
      mockPasswordGenerator,
    );

    // Utilisateurs de test
    superAdmin = new User(
      new Email('admin@company.com'),
      'Super Admin',
      UserRole.SUPER_ADMIN,
    );

    // Configuration des mocks par défaut
    mockUserRepository.findById.mockResolvedValue(superAdmin);
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.emailExists.mockResolvedValue(false);
  });

  describe('🟢 TDD GREEN: Implementation Working', () => {
    it('should create user with email workflow successfully', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: superAdmin.id,
      };

      const newUser = new User(
        new Email('newuser@company.com'),
        'New User',
        UserRole.USER,
      );
      mockUserRepository.save.mockResolvedValue(newUser);

      // Act
      const result = await useCase.execute(request);

      // Assert - Password generation was called
      expect(
        mockPasswordGenerator.generateTemporaryPassword,
      ).toHaveBeenCalledTimes(1);

      // Assert - User was saved
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: expect.objectContaining({ value: 'newuser@company.com' }),
          name: 'New User',
          role: UserRole.USER,
        }),
      );

      // Assert - Welcome email was sent
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'newuser@company.com',
        'New User',
        'TempPass123!',
        expect.any(String), // login URL
      );

      // Assert - Response is correct
      expect(result.email).toBe('newuser@company.com');
      expect(result.name).toBe('New User');
      expect(result.role).toBe(UserRole.USER);
    });

    it('should handle email delivery failure gracefully', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: superAdmin.id,
      };

      const newUser = new User(
        new Email('newuser@company.com'),
        'New User',
        UserRole.USER,
      );
      mockUserRepository.save.mockResolvedValue(newUser);

      // Mock email service to fail
      mockEmailService.sendWelcomeEmail.mockRejectedValue(
        new Error('Email service unavailable'),
      );

      // Act & Assert - Should not throw, but log warning
      const result = await useCase.execute(request);

      // User creation should succeed despite email failure
      expect(result.email).toBe('newuser@company.com');

      // Warning should be logged
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('email'),
        expect.any(Object),
      );

      // Password generation should still work
      expect(
        mockPasswordGenerator.generateTemporaryPassword,
      ).toHaveBeenCalled();
    });

    it('should fail user creation if password generation fails', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: superAdmin.id,
      };

      // Mock password generation to fail
      mockPasswordGenerator.generateTemporaryPassword.mockRejectedValue(
        new Error('Password generation service unavailable'),
      );

      // Act & Assert - Should throw because password is critical
      await expect(useCase.execute(request)).rejects.toThrow(
        'Password generation service unavailable',
      );

      // User should not be saved if password generation fails
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });

    it('should log audit events for password generation and email delivery', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: superAdmin.id,
      };

      const newUser = new User(
        new Email('newuser@company.com'),
        'New User',
        UserRole.USER,
      );
      mockUserRepository.save.mockResolvedValue(newUser);

      // Act
      await useCase.execute(request);

      // Assert - Audit logs include security events
      // 1. Password generation audit
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'audit.password_generated',
        superAdmin.id,
        expect.objectContaining({
          targetEmail: 'newuser@company.com',
          passwordGenerated: true,
        }),
      );

      // 2. Welcome email delivery audit
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'audit.welcome_email_sent',
        superAdmin.id,
        expect.objectContaining({
          targetUserId: newUser.id,
          targetEmail: 'newuser@company.com',
          emailDelivered: true,
        }),
      );

      // 3. Standard user creation audit (from parent use case)
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'audit.user.created',
        superAdmin.id,
        expect.objectContaining({
          targetUserId: newUser.id,
          targetEmail: 'newuser@company.com',
          targetRole: UserRole.USER,
        }),
      );
    });
  });
});
