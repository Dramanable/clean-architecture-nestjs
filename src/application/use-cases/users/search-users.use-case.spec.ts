/**
 * 🧪 TEST - Search Users Use Case
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
  save: jest.fn(),
  findByEmail: jest.fn(),
  delete: jest.fn(),
  findAll: jest.fn(),
  findByRole: jest.fn(),
  emailExists: jest.fn(),
  countSuperAdmins: jest.fn(),
  export: jest.fn(),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const mockI18n = {
  t: jest.fn().mockImplementation((key: string) => key),
};

describe('🔍 SearchUsersUseCase', () => {
  let useCase: SearchUsersUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SearchUsersUseCase(
      mockUserRepository as any,
      mockLogger as any,
      mockI18n as any,
    );
  });

  const createMockUser = (
    id: string,
    email: string,
    name: string,
    role: UserRole,
  ): User => {
    const user = User.create(Email.create(email), name, role);
    Object.defineProperty(user, 'id', { value: id, writable: false });
    return user;
  };

  describe('✅ Success Cases', () => {
    it('should return users when requested by SUPER_ADMIN', async () => {
      // Arrange
      const requestingUser = createMockUser(
        'admin-123',
        'admin@example.com',
        'Admin User',
        UserRole.SUPER_ADMIN,
      );

      const searchResults = [
        createMockUser(
          'user-1',
          'user1@example.com',
          'User One',
          UserRole.USER,
        ),
        createMockUser(
          'user-2',
          'user2@example.com',
          'User Two',
          UserRole.MANAGER,
        ),
      ];

      const request = {
        requestingUserId: requestingUser.id,
        searchTerm: 'user',
        page: 1,
        limit: 20,
      };

      mockUserRepository.findById.mockResolvedValue(requestingUser);
      mockUserRepository.search.mockResolvedValue({
        data: searchResults,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toEqual(
        expect.objectContaining({
          id: 'user-1',
          email: 'user1@example.com',
          name: 'User One',
          role: UserRole.USER,
        }),
      );
    });

    it('should return users with role filters when specified', async () => {
      // Arrange
      const requestingUser = createMockUser(
        'admin-123',
        'admin@example.com',
        'Admin User',
        UserRole.SUPER_ADMIN,
      );

      const searchResults = [
        createMockUser(
          'manager-1',
          'manager1@example.com',
          'Manager One',
          UserRole.MANAGER,
        ),
      ];

      const request = {
        requestingUserId: requestingUser.id,
        roles: [UserRole.MANAGER],
        page: 1,
        limit: 10,
      };

      mockUserRepository.findById.mockResolvedValue(requestingUser);
      mockUserRepository.search.mockResolvedValue({
        data: searchResults,
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
      const result = await useCase.execute(request);

      // Assert
      expect(result.users).toHaveLength(1);
      expect(result.users[0]).toEqual(
        expect.objectContaining({
          id: 'manager-1',
          role: UserRole.MANAGER,
        }),
      );
    });
  });

  describe('🚫 Authorization Cases', () => {
    it('should reject when requesting user is not SUPER_ADMIN', async () => {
      // Arrange
      const requestingUser = createMockUser(
        'manager-123',
        'manager@example.com',
        'Manager User',
        UserRole.MANAGER,
      );

      const request = {
        requestingUserId: requestingUser.id,
        page: 1,
        limit: 20,
      };

      mockUserRepository.findById.mockResolvedValue(requestingUser);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(ForbiddenError);
      expect(mockUserRepository.search).not.toHaveBeenCalled();
    });

    it('should reject when requesting user not found', async () => {
      // Arrange
      const request = {
        requestingUserId: 'non-existent-user',
        page: 1,
        limit: 20,
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(UserNotFoundError);
      expect(mockUserRepository.search).not.toHaveBeenCalled();
    });
  });

  describe('⚙️ Validation Cases', () => {
    it('should use default pagination when not specified', async () => {
      // Arrange
      const requestingUser = createMockUser(
        'admin-123',
        'admin@example.com',
        'Admin User',
        UserRole.SUPER_ADMIN,
      );

      const request = {
        requestingUserId: requestingUser.id,
      };

      mockUserRepository.findById.mockResolvedValue(requestingUser);
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
      await useCase.execute(request);

      // Assert
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        }),
      );
    });
  });

  describe('📝 Logging Cases', () => {
    it('should log search attempt and success', async () => {
      // Arrange
      const requestingUser = createMockUser(
        'admin-123',
        'admin@example.com',
        'Admin User',
        UserRole.SUPER_ADMIN,
      );

      const request = {
        requestingUserId: requestingUser.id,
        searchTerm: 'test',
      };

      mockUserRepository.findById.mockResolvedValue(requestingUser);
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
      await useCase.execute(request);

      // Assert
      expect(mockI18n.t).toHaveBeenCalledWith('operations.user.search_attempt');
      expect(mockI18n.t).toHaveBeenCalledWith('operations.user.search_success');
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });
  });
});
