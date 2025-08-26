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
import { MockI18nService } from '../../mocks/mock-i18n.service';
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
    } as unknown as jest.Mocked<UserRepository>;

    // Mock du logger
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

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

      // Assert - Vérifier les clés i18n (pas les messages traduits)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'operations.user.creation_attempt',
        expect.any(Object),
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'operations.user.validation_process',
        expect.any(Object),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('success.user.creation_success'), // Clé i18n
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
        'warnings.user.not_found',
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

      // Assert - Vérifier les clés i18n (pas les messages traduits)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'operations.user.creation_attempt',
        expect.any(Object),
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'operations.user.validation_process', // Clé i18n
        expect.any(Object),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('success.user.creation_success'), // Clé i18n
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
        'warnings.user.not_found',
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

      // Assert - Vérifier les clés i18n avec paramètres dynamiques
      expect(mockLogger.info).toHaveBeenCalledWith(
        'operations.user.creation_attempt',
        expect.any(Object),
      );

      expect(mockLogger.audit).toHaveBeenCalledWith(
        'audit.user.created', // Clé i18n
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
        'operations.permission.check',
        expect.any(Object),
      );
    });
  });
});
