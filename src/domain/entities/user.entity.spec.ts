/**
 * 🧪 TDD - User Entity avec Rôles
 *
 * Tests pour l'entité User avec Email VO et système de rôles
 */

import { User } from './user.entity';
import { Email } from '../value-objects/email.vo';
import { UserRole, Permission } from '../../shared/enums/user-role.enum';

describe('User Entity with Roles', () => {
  let validEmail: Email;

  beforeEach(() => {
    validEmail = new Email('test@example.com');
  });

  describe('User Creation', () => {
    it('should create user with email, name and role', () => {
      // Arrange & Act
      const user = new User(validEmail, 'John Doe', UserRole.USER);

      // Assert
      expect(user.email).toBe(validEmail);
      expect(user.name).toBe('John Doe');
      expect(user.role).toBe(UserRole.USER);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should create super admin user', () => {
      const user = new User(validEmail, 'Super Admin', UserRole.SUPER_ADMIN);

      expect(user.role).toBe(UserRole.SUPER_ADMIN);
      expect(user.isSuperAdmin()).toBe(true);
    });

    it('should create manager user', () => {
      const user = new User(validEmail, 'Manager', UserRole.MANAGER);

      expect(user.role).toBe(UserRole.MANAGER);
      expect(user.isManager()).toBe(true);
    });
  });

  describe('Permissions System', () => {
    it('should allow super admin to have all permissions', () => {
      // Arrange
      const superAdmin = new User(
        validEmail,
        'Super Admin',
        UserRole.SUPER_ADMIN,
      );

      // Act & Assert
      expect(superAdmin.hasPermission(Permission.MANAGE_SYSTEM)).toBe(true);
      expect(superAdmin.hasPermission(Permission.CREATE_USER)).toBe(true);
      expect(superAdmin.hasPermission(Permission.DELETE_USER)).toBe(true);
      expect(superAdmin.hasPermission(Permission.MANAGE_ROLES)).toBe(true);
    });

    it('should allow manager to manage team but not system', () => {
      const manager = new User(validEmail, 'Manager', UserRole.MANAGER);

      expect(manager.hasPermission(Permission.MANAGE_TEAM)).toBe(true);
      expect(manager.hasPermission(Permission.CREATE_USER)).toBe(true);
      expect(manager.hasPermission(Permission.VIEW_REPORTS)).toBe(true);

      // Ne peut pas gérer le système
      expect(manager.hasPermission(Permission.MANAGE_SYSTEM)).toBe(false);
      expect(manager.hasPermission(Permission.MANAGE_ROLES)).toBe(false);
    });

    it('should limit user to basic permissions only', () => {
      const user = new User(validEmail, 'Regular User', UserRole.USER);

      expect(user.hasPermission(Permission.VIEW_USER)).toBe(true);
      expect(user.hasPermission(Permission.UPDATE_USER)).toBe(true);

      // Ne peut pas faire d'actions avancées
      expect(user.hasPermission(Permission.CREATE_USER)).toBe(false);
      expect(user.hasPermission(Permission.DELETE_USER)).toBe(false);
      expect(user.hasPermission(Permission.MANAGE_TEAM)).toBe(false);
    });
  });

  describe('Business Rules - User Actions', () => {
    it('should allow super admin to act on any user', () => {
      const superAdmin = new User(
        validEmail,
        'Super Admin',
        UserRole.SUPER_ADMIN,
      );
      const regularUser = new User(
        new Email('user@example.com'),
        'User',
        UserRole.USER,
      );
      const manager = new User(
        new Email('manager@example.com'),
        'Manager',
        UserRole.MANAGER,
      );

      expect(superAdmin.canActOnUser(regularUser)).toBe(true);
      expect(superAdmin.canActOnUser(manager)).toBe(true);
      expect(superAdmin.canActOnUser(superAdmin)).toBe(true);
    });

    it('should allow manager to act on regular users only', () => {
      const manager = new User(validEmail, 'Manager', UserRole.MANAGER);
      const regularUser = new User(
        new Email('user@example.com'),
        'User',
        UserRole.USER,
      );
      const anotherManager = new User(
        new Email('manager2@example.com'),
        'Manager 2',
        UserRole.MANAGER,
      );

      expect(manager.canActOnUser(regularUser)).toBe(true);
      expect(manager.canActOnUser(anotherManager)).toBe(false);
      expect(manager.canActOnUser(manager)).toBe(true); // Peut agir sur lui-même
    });

    it('should allow regular user to act only on themselves', () => {
      const user = new User(validEmail, 'User', UserRole.USER);
      const anotherUser = new User(
        new Email('other@example.com'),
        'Other User',
        UserRole.USER,
      );

      expect(user.canActOnUser(user)).toBe(true);
      expect(user.canActOnUser(anotherUser)).toBe(false);
    });
  });

  describe('Role Validation', () => {
    it('should reject invalid name', () => {
      expect(() => new User(validEmail, '', UserRole.USER)).toThrow(
        'Name cannot be empty',
      );
    });

    it('should normalize name', () => {
      const user = new User(validEmail, '  John Doe  ', UserRole.USER);
      expect(user.name).toBe('John Doe');
    });
  });

  describe('User Comparison', () => {
    it('should be equal when same email', () => {
      const user1 = new User(validEmail, 'John', UserRole.USER);
      const user2 = new User(validEmail, 'Jane', UserRole.MANAGER);

      expect(user1.hasSameEmail(user2)).toBe(true);
    });

    it('should not be equal when different email', () => {
      const email2 = new Email('other@example.com');
      const user1 = new User(validEmail, 'John', UserRole.USER);
      const user2 = new User(email2, 'Jane', UserRole.USER);

      expect(user1.hasSameEmail(user2)).toBe(false);
    });
  });
});
