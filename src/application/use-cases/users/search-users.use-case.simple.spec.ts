/**
 * 🧪 TEST SIMPLE - Search Users Use Case (TDD)
 */

import { SearchUsersUseCase } from './search-users.use-case';
import { UserRole } from '../../../shared/enums/user-role.enum';
import {
  ForbiddenError,
  UserNotFoundError,
} from '../../exceptions/auth.exceptions';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';

// 🎭 Mocks simples
const mockUserRepository = {
  findById: jest.fn(),
  search: jest.fn(),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

const mockI18n = {
  t: jest.fn().mockImplementation((key: string) => key),
};

describe('🔍 SearchUsersUseCase', () => {
  let useCase: SearchUsersUseCase;
  let superAdminUser: User;
  let regularUser: User;

  beforeEach(() => {
    useCase = new SearchUsersUseCase(
      mockUserRepository as any,
      mockLogger as any,
      mockI18n as any,
    );

    // Création des utilisateurs de test
    superAdminUser = User.createWithHashedPassword(
      'super-admin-id',
      new Email('admin@test.com'),
      'Super Admin',
      UserRole.SUPER_ADMIN,
      'hashedPassword',
      new Date(),
    );

    regularUser = User.createWithHashedPassword(
      'regular-user-id',
      new Email('user@test.com'),
      'Regular User',
      UserRole.USER,
      'hashedPassword',
      new Date(),
    );

    // Reset des mocks
    jest.clearAllMocks();
  });

  describe('🔐 Authorization Tests', () => {
    it('should throw ForbiddenError when user is not SUPER_ADMIN', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(regularUser);

      // Act & Assert
      await expect(
        useCase.execute({
          requestingUserId: 'regular-user-id',
          page: 1,
          limit: 10,
        }),
      ).rejects.toThrow(ForbiddenError);
    });

    it('should throw UserNotFoundError when requesting user does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute({
          requestingUserId: 'non-existent-id',
          page: 1,
          limit: 10,
        }),
      ).rejects.toThrow(UserNotFoundError);
    });

    it('should allow SUPER_ADMIN to search users', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(superAdminUser);
      mockUserRepository.search.mockResolvedValue({
        data: [regularUser],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      const result = await useCase.execute({
        requestingUserId: 'super-admin-id',
        page: 1,
        limit: 10,
      });

      // Assert
      expect(result.users).toHaveLength(1);
      expect(result.users[0].email).toBe('user@test.com');
      expect(result.pagination.totalItems).toBe(1);
    });
  });

  describe('📊 Search Parameters Tests', () => {
    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(superAdminUser);
    });

    it('should apply default pagination when not provided', async () => {
      // Arrange
      mockUserRepository.search.mockResolvedValue({
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      await useCase.execute({
        requestingUserId: 'super-admin-id',
      });

      // Assert
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        }),
      );
    });

    it('should normalize pagination parameters', async () => {
      // Arrange
      mockUserRepository.search.mockResolvedValue({
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 50,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      await useCase.execute({
        requestingUserId: 'super-admin-id',
        page: 0, // Should be normalized to 1
        limit: 200, // Should be capped to 100
      });

      // Assert
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 100,
        }),
      );
    });
  });

  describe('🎯 Filtering Tests', () => {
    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(superAdminUser);
      mockUserRepository.search.mockResolvedValue({
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should apply search term filter', async () => {
      // Act
      await useCase.execute({
        requestingUserId: 'super-admin-id',
        searchTerm: 'john',
      });

      // Assert
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          search: {
            query: 'john',
          },
        }),
      );
    });

    it('should apply role filters', async () => {
      // Act
      await useCase.execute({
        requestingUserId: 'super-admin-id',
        roles: [UserRole.MANAGER, UserRole.USER],
      });

      // Assert
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            role: [UserRole.MANAGER, UserRole.USER],
          }),
        }),
      );
    });

    it('should apply date range filters', async () => {
      // Arrange
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');

      // Act
      await useCase.execute({
        requestingUserId: 'super-admin-id',
        createdAfter: startDate,
        createdBefore: endDate,
      });

      // Assert
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            createdAt: {
              from: startDate,
              to: endDate,
            },
          }),
        }),
      );
    });
  });

  describe('📝 Logging Tests', () => {
    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(superAdminUser);
      mockUserRepository.search.mockResolvedValue({
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should log search attempts', async () => {
      // Act
      await useCase.execute({
        requestingUserId: 'super-admin-id',
      });

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'operations.user.search_attempt',
        expect.any(Object),
      );
    });

    it('should log successful searches', async () => {
      // Act
      await useCase.execute({
        requestingUserId: 'super-admin-id',
      });

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'operations.user.search_success',
        expect.objectContaining({
          resultCount: expect.any(Number),
          totalItems: expect.any(Number),
        }),
      );
    });

    it('should log errors', async () => {
      // Arrange
      const error = new Error('Database error');
      mockUserRepository.search.mockRejectedValue(error);

      // Act & Assert
      await expect(
        useCase.execute({
          requestingUserId: 'super-admin-id',
        }),
      ).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'operations.user.search_failed',
        error,
        expect.any(Object),
      );
    });
  });
});
