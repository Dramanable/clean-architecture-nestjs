/**
 * 🧪 TDD - User Onboarding Application Service
 *
 * Tests pour le service d'application qui respecte la Clean Architecture
 * Approche TDD pour valider l'orchestration complexe
 */

import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { UserRole } from '../../shared/enums/user-role.enum';
import { IEmailService } from '../ports/email.port';
import { I18nService } from '../ports/i18n.port';
import { Logger } from '../ports/logger.port';
import { IPasswordGenerator } from '../ports/password-generator.port';
import { CreateUserUseCase } from '../use-cases/users/create-user.use-case';
import { UserOnboardingApplicationService } from './user-onboarding.application-service';

describe('UserOnboardingApplicationService - Clean Architecture', () => {
  let onboardingService: UserOnboardingApplicationService;
  let mockCreateUserUseCase: jest.Mocked<CreateUserUseCase>;
  let mockEmailService: jest.Mocked<IEmailService>;
  let mockPasswordGenerator: jest.Mocked<IPasswordGenerator>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  // Test data
  let superAdmin: User;

  beforeEach(() => {
    // Mock du use case de création d'utilisateur
    mockCreateUserUseCase = {
      execute: jest.fn(),
    } as any;

    // Mock email service
    mockEmailService = {
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      sendNotificationEmail: jest.fn().mockResolvedValue(undefined),
    };

    // Mock password generator
    mockPasswordGenerator = {
      generateTemporaryPassword: jest.fn().mockResolvedValue('SecureTemp123!'),
      generateResetToken: jest.fn().mockResolvedValue('reset-token-123'),
      validatePasswordStrength: jest.fn().mockResolvedValue({
        isValid: true,
        score: 4,
        feedback: [],
      }),
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

    // Service d'application sous test
    onboardingService = new UserOnboardingApplicationService(
      mockCreateUserUseCase,
      mockEmailService,
      mockPasswordGenerator,
      mockLogger,
      mockI18n,
    );

    // Données de test
    superAdmin = new User(
      new Email('admin@company.com'),
      'Super Admin',
      UserRole.SUPER_ADMIN,
    );
  });

  describe('🎯 Clean Architecture Compliance', () => {
    it('should orchestrate user creation and onboarding without violating architecture layers', async () => {
      // Arrange
      const request = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: superAdmin.id,
        sendWelcomeEmail: true,
      };

      const userCreationResult = {
        id: 'user-123',
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        createdAt: new Date(),
      };

      mockCreateUserUseCase.execute.mockResolvedValue(userCreationResult);

      // Act
      const result = await onboardingService.createUserWithOnboarding(request);

      // Assert - Vérifie l'orchestration correcte
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(request);
      expect(
        mockPasswordGenerator.generateTemporaryPassword,
      ).toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'newuser@company.com',
        'New User',
        'SecureTemp123!',
        expect.any(String),
      );

      // Assert - Vérifie la réponse enrichie
      expect(result).toEqual({
        ...userCreationResult,
        onboardingStatus: {
          passwordGenerated: true,
          emailSent: true,
          auditEvents: ['user_created', 'password_generated', 'email_sent'],
        },
      });
    });

    it('should handle email failures gracefully without breaking user creation', async () => {
      // Arrange
      const request = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: superAdmin.id,
        sendWelcomeEmail: true,
      };

      const userCreationResult = {
        id: 'user-123',
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        createdAt: new Date(),
      };

      mockCreateUserUseCase.execute.mockResolvedValue(userCreationResult);
      mockEmailService.sendWelcomeEmail.mockRejectedValue(
        new Error('Email service unavailable'),
      );

      // Act
      const result = await onboardingService.createUserWithOnboarding(request);

      // Assert - L'utilisateur est créé malgré l'échec d'email
      expect(result.id).toBe('user-123');
      expect(result.onboardingStatus.emailSent).toBe(false);
      expect(result.onboardingStatus.passwordGenerated).toBe(true);
      expect(result.onboardingStatus.auditEvents).toContain('email_failed');

      // Assert - Warning loggé
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('warnings.email.delivery_failed'),
        expect.any(Object),
      );
    });

    it('should fail completely if user creation fails', async () => {
      // Arrange
      const request = {
        email: 'invalid@company.com',
        name: 'Invalid User',
        role: UserRole.USER,
        requestingUserId: superAdmin.id,
      };

      mockCreateUserUseCase.execute.mockRejectedValue(
        new Error('User creation failed'),
      );

      // Act & Assert
      await expect(
        onboardingService.createUserWithOnboarding(request),
      ).rejects.toThrow('User creation failed');

      // Aucun service d'onboarding ne doit être appelé
      expect(
        mockPasswordGenerator.generateTemporaryPassword,
      ).not.toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });

    it('should fail if password generation fails (critical step)', async () => {
      // Arrange
      const request = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: superAdmin.id,
        sendWelcomeEmail: true,
      };

      const userCreationResult = {
        id: 'user-123',
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        createdAt: new Date(),
      };

      mockCreateUserUseCase.execute.mockResolvedValue(userCreationResult);
      mockPasswordGenerator.generateTemporaryPassword.mockRejectedValue(
        new Error('Password generation service unavailable'),
      );

      // Act & Assert
      await expect(
        onboardingService.createUserWithOnboarding(request),
      ).rejects.toThrow('Password generation service unavailable');

      // Email ne doit pas être envoyé si le password échoue
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });

    it('should handle manual onboarding (no email) correctly', async () => {
      // Arrange
      const request = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: superAdmin.id,
        sendWelcomeEmail: false, // Onboarding manuel
      };

      const userCreationResult = {
        id: 'user-123',
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        createdAt: new Date(),
      };

      mockCreateUserUseCase.execute.mockResolvedValue(userCreationResult);

      // Act
      const result = await onboardingService.createUserWithOnboarding(request);

      // Assert - Pas de génération de password ni d'email
      expect(
        mockPasswordGenerator.generateTemporaryPassword,
      ).not.toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();

      expect(result.onboardingStatus).toEqual({
        passwordGenerated: false,
        emailSent: false,
        auditEvents: ['user_created'],
      });
    });

    it('should create comprehensive audit trail for all onboarding steps', async () => {
      // Arrange
      const request = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: superAdmin.id,
        sendWelcomeEmail: true,
      };

      const userCreationResult = {
        id: 'user-123',
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        createdAt: new Date(),
      };

      mockCreateUserUseCase.execute.mockResolvedValue(userCreationResult);

      // Act
      await onboardingService.createUserWithOnboarding(request);

      // Assert - Audit trail complet
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'audit.password_generated',
        superAdmin.id,
        expect.objectContaining({
          targetUserId: 'user-123',
          targetEmail: 'newuser@company.com',
        }),
      );

      expect(mockLogger.audit).toHaveBeenCalledWith(
        'audit.welcome_email_sent',
        superAdmin.id,
        expect.objectContaining({
          targetUserId: 'user-123',
          targetEmail: 'newuser@company.com',
          emailDelivered: true,
        }),
      );

      expect(mockLogger.audit).toHaveBeenCalledWith(
        'audit.user_onboarding_process',
        superAdmin.id,
        expect.objectContaining({
          targetUserId: 'user-123',
          passwordGenerated: true,
          emailSent: true,
          processSteps: ['user_created', 'password_generated', 'email_sent'],
        }),
      );
    });
  });
});
