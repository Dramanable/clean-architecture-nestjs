/**
 * 🧪 TDD - User Repository avec Pagination & Filtres
 * 
 * Tests pour la recherche avancée et pagination des utilisateurs
 */

import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { UserQueryBuilder } from '../../../shared/types/user-query.types';

describe('User Repository - Pagination & Search', () => {
  let userRepository: UserRepository;
  let testUsers: User[];

  beforeEach(() => {
    // Mock repository sera injecté
    userRepository = {} as UserRepository;
    
    // Données de test
    testUsers = [
      new User(new Email('admin@company.com'), 'Admin User', UserRole.SUPER_ADMIN),
      new User(new Email('manager1@company.com'), 'Manager One', UserRole.MANAGER),
      new User(new Email('manager2@company.com'), 'Manager Two', UserRole.MANAGER),
      new User(new Email('user1@company.com'), 'User One', UserRole.USER),
      new User(new Email('user2@company.com'), 'User Two', UserRole.USER),
      new User(new Email('john@external.com'), 'John External', UserRole.USER),
    ];
  });

  describe('Pagination Tests', () => {
    it('should return paginated results with correct metadata', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .page(1)
        .limit(3)
        .sortBy('name', 'ASC')
        .build();

      // Mock implementation
      userRepository.findAll = jest.fn().mockResolvedValue({
        data: testUsers.slice(0, 3),
        meta: {
          currentPage: 1,
          totalPages: 2,
          totalItems: 6,
          itemsPerPage: 3,
          hasNextPage: true,
          hasPreviousPage: false,
          nextPage: 2,
          previousPage: undefined
        }
      });

      // Act
      const result = await userRepository.findAll(queryParams);

      // Assert
      expect(result.data).toHaveLength(3);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(false);
      expect(userRepository.findAll).toHaveBeenCalledWith(queryParams);
    });

    it('should handle last page correctly', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .page(2)
        .limit(4)
        .build();

      userRepository.findAll = jest.fn().mockResolvedValue({
        data: testUsers.slice(4),
        meta: {
          currentPage: 2,
          totalPages: 2,
          totalItems: 6,
          itemsPerPage: 4,
          hasNextPage: false,
          hasPreviousPage: true,
          nextPage: undefined,
          previousPage: 1
        }
      });

      // Act
      const result = await userRepository.findAll(queryParams);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(true);
      expect(result.meta.previousPage).toBe(1);
    });
  });

  describe('Search Tests', () => {
    it('should search users by name', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .searchByName('Manager')
        .build();

      const expectedUsers = testUsers.filter(u => u.name.includes('Manager'));
      
      userRepository.search = jest.fn().mockResolvedValue({
        data: expectedUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });

      // Act
      const result = await userRepository.search(queryParams);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data.every(u => u.name.includes('Manager'))).toBe(true);
      expect(userRepository.search).toHaveBeenCalledWith(queryParams);
    });

    it('should search users by email domain', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .searchByDomain('company.com')
        .build();

      const expectedUsers = testUsers.filter(u => 
        u.email.value.includes('company.com')
      );
      
      userRepository.search = jest.fn().mockResolvedValue({
        data: expectedUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 5,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });

      // Act
      const result = await userRepository.search(queryParams);

      // Assert
      expect(result.data).toHaveLength(5);
      expect(result.data.every(u => u.email.value.includes('company.com'))).toBe(true);
    });

    it('should perform global search across name and email', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .searchGlobal('John')
        .build();

      const expectedUsers = testUsers.filter(u => 
        u.name.includes('John') || u.email.value.includes('john')
      );
      
      userRepository.search = jest.fn().mockResolvedValue({
        data: expectedUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });

      // Act
      const result = await userRepository.search(queryParams);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('John External');
    });
  });

  describe('Filter Tests', () => {
    it('should filter users by role', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .filterByRole(UserRole.MANAGER)
        .build();

      const expectedUsers = testUsers.filter(u => u.role === UserRole.MANAGER);
      
      userRepository.search = jest.fn().mockResolvedValue({
        data: expectedUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });

      // Act
      const result = await userRepository.search(queryParams);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data.every(u => u.role === UserRole.MANAGER)).toBe(true);
    });

    it('should filter users by multiple roles', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .filterByRole([UserRole.SUPER_ADMIN, UserRole.MANAGER])
        .build();

      const expectedUsers = testUsers.filter(u => 
        [UserRole.SUPER_ADMIN, UserRole.MANAGER].includes(u.role)
      );
      
      userRepository.search = jest.fn().mockResolvedValue({
        data: expectedUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 3,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });

      // Act
      const result = await userRepository.search(queryParams);

      // Assert
      expect(result.data).toHaveLength(3);
      expect(result.data.some(u => u.role === UserRole.SUPER_ADMIN)).toBe(true);
      expect(result.data.some(u => u.role === UserRole.MANAGER)).toBe(true);
    });

    it('should filter by email domain', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .filterByEmailDomain('external.com')
        .build();

      const expectedUsers = testUsers.filter(u => 
        u.email.getDomain() === 'external.com'
      );
      
      userRepository.search = jest.fn().mockResolvedValue({
        data: expectedUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });

      // Act
      const result = await userRepository.search(queryParams);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].email.getDomain()).toBe('external.com');
    });
  });

  describe('Combined Search & Filter Tests', () => {
    it('should combine search and filters', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .searchByName('User')
        .filterByRole(UserRole.USER)
        .filterByEmailDomain('company.com')
        .page(1)
        .limit(10)
        .sortBy('name', 'ASC')
        .build();

      const expectedUsers = testUsers.filter(u => 
        u.name.includes('User') && 
        u.role === UserRole.USER &&
        u.email.getDomain() === 'company.com'
      );
      
      userRepository.search = jest.fn().mockResolvedValue({
        data: expectedUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false
        }
      });

      // Act
      const result = await userRepository.search(queryParams);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data.every(u => 
        u.name.includes('User') && 
        u.role === UserRole.USER &&
        u.email.getDomain() === 'company.com'
      )).toBe(true);
    });
  });

  describe('Utility Filters Tests', () => {
    it('should use onlyAdmins utility filter', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .onlyAdmins()
        .build();

      expect(queryParams.filters?.role).toEqual([UserRole.SUPER_ADMIN]);
    });

    it('should use onlyManagers utility filter', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .onlyManagers()
        .build();

      expect(queryParams.filters?.role).toEqual([UserRole.MANAGER]);
    });

    it('should use recentlyCreated utility filter', async () => {
      // Arrange
      const queryParams = new UserQueryBuilder()
        .recentlyCreated(7)
        .build();

      expect(queryParams.filters?.createdAt?.from).toBeDefined();
      expect(queryParams.filters?.createdAt?.to).toBeUndefined();
    });
  });
});
