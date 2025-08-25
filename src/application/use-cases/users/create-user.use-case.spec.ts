/**
 * 🧪 TDD - Create User Use Case
 * 
 * Tests pour la création d'utilisateurs avec règles métier strictes
 */

import { CreateUserUseCase } from './create-user.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { Logger } from '../../ports/logger.port';
import type { I18nService } from '../../ports/i18n.port';
import { MockI18nService } from '../../../infrastructure/i18n/i18n.service';
import {
  UserNotFoundError,
  EmailAlreadyExistsError,
  InsufficientPermissionsError,
  InvalidEmailFormatError,
  InvalidNameError,
  RoleElevationError,
} from '../../../domain/exceptions/user.exceptions';

// DTOs
interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
  requestingUserId: string;
}

interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: MockI18nService;
  let superAdminUser: User;
  let managerUser: User;
  let regularUser: User;

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

    // Utilisateurs de test
    superAdminUser = new User(
      new Email('admin@company.com'),
      'Super Admin',
      UserRole.SUPER_ADMIN
    );

    managerUser = new User(
      new Email('manager@company.com'),
      'Manager User',
      UserRole.MANAGER
    );

    regularUser = new User(
      new Email('user@company.com'),
      'Regular User',
      UserRole.USER
    );
  });

  describe('Successful User Creation', () => {
    it('should create user when super admin creates any role', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.MANAGER,
        requestingUserId: 'admin-id'
      };

      mockUserRepository.findById.mockResolvedValue(superAdminUser);
      mockUserRepository.findByEmail.mockResolvedValue(null); // Email disponible
      
      const savedUser = new User(
        new Email(request.email),
        request.name,
        request.role
      );
      mockUserRepository.save.mockResolvedValue(savedUser);

      // Act
      const result = await createUserUseCase.execute(request);

      // Assert
      expect(result.email).toBe(request.email);
      expect(result.name).toBe(request.name);
      expect(result.role).toBe(request.role);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('admin-id');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        new Email(request.email),
      );
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.any(User));
      expect(mockLogger.info).toHaveBeenCalledTimes(2); // Début + succès
      expect(mockLogger.audit).toHaveBeenCalledWith(
        'User created', // Traduit maintenant
        'admin-id',
        expect.any(Object),
      );
    });

    it('should create regular user when manager creates user', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: 'manager-id'
      };

      mockUserRepository.findById.mockResolvedValue(managerUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      const savedUser = new User(
        new Email(request.email),
        request.name,
        request.role
      );
      mockUserRepository.save.mockResolvedValue(savedUser);

      // Act
      const result = await createUserUseCase.execute(request);

      // Assert
      expect(result.role).toBe(UserRole.USER);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('Authorization Rules', () => {
    it('should reject when regular user tries to create user', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: 'user-id'
      };

      mockUserRepository.findById.mockResolvedValue(regularUser);

      // Act & Assert
      await expect(createUserUseCase.execute(request))
        .rejects
        .toThrow(InsufficientPermissionsError);
      
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should reject when manager tries to create admin', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newadmin@company.com',
        name: 'New Admin',
        role: UserRole.SUPER_ADMIN,
        requestingUserId: 'manager-id'
      };

      mockUserRepository.findById.mockResolvedValue(managerUser);

      // Act & Assert
      await expect(createUserUseCase.execute(request))
        .rejects
        .toThrow(RoleElevationError);
      
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should reject when manager tries to create another manager', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newmanager@company.com',
        name: 'New Manager',
        role: UserRole.MANAGER,
        requestingUserId: 'manager-id',
      };

      mockUserRepository.findById.mockResolvedValue(managerUser);

      // Act & Assert
      await expect(createUserUseCase.execute(request))
        .rejects
        .toThrow(RoleElevationError);
      
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Business Rules Validation', () => {
    it('should reject when requesting user not found', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'newuser@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: 'invalid-id',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(createUserUseCase.execute(request))
        .rejects
        .toThrow(UserNotFoundError);
    });

    it('should reject when email already exists', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'existing@company.com',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: 'admin-id',
      };

      const existingUser = new User(
        new Email('existing@company.com'),
        'Existing User',
        UserRole.USER,
      );

      mockUserRepository.findById.mockResolvedValue(superAdminUser);
      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(createUserUseCase.execute(request))
        .rejects
        .toThrow(EmailAlreadyExistsError);
      
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should reject invalid email format', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'invalid-email',
        name: 'New User',
        role: UserRole.USER,
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById.mockResolvedValue(superAdminUser);

      // Act & Assert
      await expect(createUserUseCase.execute(request))
        .rejects
        .toThrow(InvalidEmailFormatError);
    });

    it('should reject empty name', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: 'valid@company.com',
        name: '',
        role: UserRole.USER,
        requestingUserId: 'admin-id',
      };

      mockUserRepository.findById.mockResolvedValue(superAdminUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(createUserUseCase.execute(request))
        .rejects
        .toThrow(InvalidNameError);
    });
  });

  describe('Data Sanitization', () => {
    it('should normalize email and name', async () => {
      // Arrange
      const request: CreateUserRequest = {
        email: '  NewUser@Company.COM  ',
        name: '  New User  ',
        role: UserRole.USER,
        requestingUserId: 'admin-id'
      };

      mockUserRepository.findById.mockResolvedValue(superAdminUser);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      
      const savedUser = new User(
        new Email('newuser@company.com'),
        'New User',
        request.role
      );
      mockUserRepository.save.mockResolvedValue(savedUser);

      // Act
      const result = await createUserUseCase.execute(request);

      // Assert
      expect(result.email).toBe('newuser@company.com');
      expect(result.name).toBe('New User');
    });
  });
});
