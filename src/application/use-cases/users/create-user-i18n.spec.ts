/**
 * 🧪 TDD - i18n Integration Test
 *
 * Tests pour vérifier l'internationalisation des logs et erreurs
 */

import { CreateUserUseCase } from './create-user.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { Logger } from '../../ports/logger.port';
import { MockI18nService } from '../../../infrastructure/i18n/i18n.service';
import { UserNotFoundError } from '../../../domain/exceptions/user.exceptions';

interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
  requestingUserId: string;
}

describe('CreateUserUseCase - i18n Integration', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: MockI18nService;

  beforeEach(() => {
    // Mock du repository
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
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

    // Mock i18n (vraie instance pour tester les traductions)
    mockI18n = new MockI18nService();

    // Use case à tester
    createUserUseCase = new CreateUserUseCase(
      mockUserRepository,
      mockLogger,
      mockI18n,
    );
  });

  describe('English Translation Tests', () => {
    beforeEach(() => {
      mockI18n.setDefaultLanguage('en');
    });

    it('should log creation attempt in English', async () => {
      // Arrange
      const superAdmin = new User(
        new Email('admin@company.com'),
        'Super Admin',
        UserRole.SUPER_ADMIN,
      );

      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById.mockResolvedValue(superAdmin);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(
        new User(new Email(request.email), request.name, request.role),
      );

      // Act
      await createUserUseCase.execute(request);

      // Assert - Vérifier les messages en anglais
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting to create user',
        expect.any(Object),
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Starting user validation process',
        expect.any(Object),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('created successfully by'),
        expect.any(Object),
      );
    });

    it('should log user not found error in English', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: 'invalid-id',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'User operation failed: requesting user not found',
        expect.any(Object),
      );
    });
  });

  describe('French Translation Tests', () => {
    beforeEach(() => {
      mockI18n.setDefaultLanguage('fr');
    });

    it('should log creation attempt in French', async () => {
      // Arrange
      const superAdmin = new User(
        new Email('admin@company.com'),
        'Super Admin',
        UserRole.SUPER_ADMIN,
      );

      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById.mockResolvedValue(superAdmin);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(
        new User(new Email(request.email), request.name, request.role),
      );

      // Act
      await createUserUseCase.execute(request);

      // Assert - Vérifier les messages en français
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Tentative de création utilisateur',
        expect.any(Object),
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Début du processus de validation utilisateur',
        expect.any(Object),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('créé avec succès par'),
        expect.any(Object),
      );
    });

    it('should log user not found error in French', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: 'invalid-id',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Échec opération utilisateur : utilisateur demandeur non trouvé',
        expect.any(Object),
      );
    });
  });

  describe('Dynamic Message Translation Tests', () => {
    beforeEach(() => {
      mockI18n.setDefaultLanguage('en');
    });

    it('should translate messages with parameters', async () => {
      // Arrange
      const superAdmin = new User(
        new Email('admin@company.com'),
        'Super Admin',
        UserRole.SUPER_ADMIN,
      );

      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById.mockResolvedValue(superAdmin);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(
        new User(new Email(request.email), request.name, request.role),
      );

      // Act
      await createUserUseCase.execute(request);

      // Assert - Vérifier le message avec paramètres dynamiques
      expect(mockLogger.info).toHaveBeenCalledWith(
        'User newuser@company.com created successfully by admin@company.com',
        expect.any(Object),
      );

      expect(mockLogger.audit).toHaveBeenCalledWith(
        'User created',
        'admin-id',
        expect.any(Object),
      );
    });

    it('should translate permission check messages', async () => {
      // Arrange
      const superAdmin = new User(
        new Email('admin@company.com'),
        'Super Admin',
        UserRole.SUPER_ADMIN,
      );

      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById.mockResolvedValue(superAdmin);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(
        new User(new Email(request.email), request.name, request.role),
      );

      // Act
      await createUserUseCase.execute(request);

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Checking permissions for CreateUser',
        expect.any(Object),
      );
    });
  });
});
