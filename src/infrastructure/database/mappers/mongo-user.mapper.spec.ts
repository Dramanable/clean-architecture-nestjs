/**
 *import { MongoUserMapper } from './mongo-user.mapper';
import { User as DomainUser } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { UserDocument } from '../entities/mongo/user.schema';TDD - MongoDB User Mapper
 * 
 * Tests pour la conversion Domain ↔ MongoDB Document
 */

import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { MongoUserMapper } from './mongo-user.mapper';

// Mock MongoDB Document
interface MockUserDocument {
  _id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  loginAttempts: number;
  lockedUntil?: Date;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  tenantId?: string;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

describe('MongoUserMapper', () => {
  let domainUser: User;
  let mongoDoc: MockUserDocument;

  beforeEach(() => {
    // Arrange - Domain User
    domainUser = new User(
      new Email('jane.doe@company.com'),
      'Jane Doe',
      UserRole.MANAGER,
    );

    // Arrange - MongoDB Document
    mongoDoc = {
      _id: 'mongo-id-123',
      email: 'jane.doe@company.com',
      name: 'Jane Doe',
      password: 'hashedMongoPassword',
      role: UserRole.MANAGER,
      isActive: true,
      loginAttempts: 0,
      emailVerified: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    };
  });

  describe('MongoDB Document → Domain Entity', () => {
    it('should convert MongoDB document to domain entity', () => {
      // Act
      const result = MongoUserMapper.toDomain(mongoDoc as unknown);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result.email.value).toBe('jane.doe@company.com');
      expect(result.name).toBe('Jane Doe');
      expect(result.role).toBe(UserRole.MANAGER);
    });

    it('should preserve MongoDB security metadata', () => {
      // Arrange
      mongoDoc.lastLoginAt = new Date('2023-01-03');
      mongoDoc.lastLoginIp = '10.0.0.1';
      mongoDoc.loginAttempts = 1;
      mongoDoc.emailVerified = true;

      // Act
      const result = MongoUserMapper.toDomain(mongoDoc as unknown);

      // Assert
      expect((result as unknown)._lastLoginAt).toEqual(new Date('2023-01-03'));
      expect((result as unknown)._lastLoginIp).toBe('10.0.0.1');
      expect((result as unknown)._loginAttempts).toBe(1);
      expect((result as unknown)._emailVerified).toBe(true);
    });

    it('should handle all user roles from MongoDB', () => {
      // Arrange
      const roles = [UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.USER];

      roles.forEach((role) => {
        mongoDoc.role = role;

        // Act
        const result = MongoUserMapper.toDomain(mongoDoc as unknown);

        // Assert
        expect(result.role).toBe(role);
      });
    });

    it('should handle MongoDB-specific fields', () => {
      // Arrange
      const mongoDoc = {
        _id: 'mongo-id-123',
        email: 'user@tenant.com',
        name: 'User Name',
        role: UserRole.USER,
        password: 'hashed_pass',
        emailVerified: true,
        loginAttempts: 2,
        lastLoginAt: new Date('2024-01-15'),
        lastLoginIp: '192.168.1.1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      } as MockUserDocument;

      // Act
      const result = MongoUserMapper.toDomain(mongoDoc as unknown);

      // Assert - MongoDB specific fields available in User
      expect((result as unknown)._emailVerified).toBe(true);
      expect((result as unknown)._loginAttempts).toBe(2);
      expect((result as unknown)._lastLoginAt).toEqual(new Date('2024-01-15'));
      expect((result as unknown)._lastLoginIp).toBe('192.168.1.1');
    });
  });

  describe('Domain Entity → MongoDB Document Data', () => {
    it('should convert domain entity to MongoDB document data', () => {
      // Act
      const result = MongoUserMapper.toMongo(domainUser);

      // Assert
      expect(result._id).toBe(domainUser.id);
      expect(result.email).toBe('jane.doe@company.com');
      expect(result.name).toBe('Jane Doe');
      expect(result.role).toBe(UserRole.MANAGER);
      expect(result.isActive).toBe(true);
    });

    it('should handle domain user with security data', () => {
      // Arrange
      (domainUser as unknown)._password = 'mongoHashedPassword';
      (domainUser as unknown)._lastLoginAt = new Date('2023-01-04');
      (domainUser as unknown)._loginAttempts = 2;
      (domainUser as unknown)._emailVerified = true;

      // Act
      const result = MongoUserMapper.toMongo(domainUser);

      // Assert
      expect(result.password).toBe('mongoHashedPassword');
      expect(result.lastLoginAt).toEqual(new Date('2023-01-04'));
      expect(result.loginAttempts).toBe(2);
      expect(result.emailVerified).toBe(true);
    });

    it('should set default values for security fields', () => {
      // Act
      const result = MongoUserMapper.toMongo(domainUser);

      // Assert
      expect(result.password).toBe('');
      expect(result.loginAttempts).toBe(0);
      expect(result.emailVerified).toBe(false);
      expect(result.isActive).toBe(true);
    });

    it('should handle multi-tenant fields', () => {
      // Arrange
      (domainUser as unknown)._tenantId = 'enterprise-corp';
      (domainUser as unknown)._metadata = { department: 'IT' };

      // Act
      const result = MongoUserMapper.toMongo(domainUser);

      // Assert
      expect(result.tenantId).toBe('enterprise-corp');
      expect(result.metadata).toEqual({ department: 'IT' });
    });
  });

  describe('Update MongoDB Document', () => {
    it('should update MongoDB document with domain changes', () => {
      // Arrange
      const updatedUser = new User(
        new Email('jane.updated@company.com'),
        'Jane Updated',
        UserRole.SUPER_ADMIN,
      );
      (updatedUser as unknown)._password = 'newMongoPassword';

      // Act
      const result = MongoUserMapper.updateMongo(
        mongoDoc as unknown,
        updatedUser,
      );

      // Assert
      expect(result.email).toBe('jane.updated@company.com');
      expect(result.name).toBe('Jane Updated');
      expect(result.role).toBe(UserRole.SUPER_ADMIN);
      expect(result.password).toBe('newMongoPassword');

      // Should preserve MongoDB metadata
      expect(result._id).toBe('mongo-id-123');
      expect(result.createdAt).toEqual(new Date('2023-01-01'));
    });

    it('should preserve password if not changed in domain', () => {
      // Arrange
      const originalPassword = mongoDoc.password;
      const updatedUser = new User(
        new Email('jane.updated@company.com'),
        'Jane Updated',
        UserRole.MANAGER,
      );

      // Act
      const result = MongoUserMapper.updateMongo(
        mongoDoc as unknown,
        updatedUser,
      );

      // Assert
      expect(result.password).toBe(originalPassword);
    });

    it('should update security metadata from domain', () => {
      // Arrange
      const updatedUser = new User(
        new Email('jane.doe@company.com'),
        'Jane Doe',
        UserRole.MANAGER,
      );
      (updatedUser as unknown)._loginAttempts = 5;
      (updatedUser as unknown)._emailVerified = true;

      // Act
      const result = MongoUserMapper.updateMongo(
        mongoDoc as unknown,
        updatedUser,
      );

      // Assert
      expect(result.loginAttempts).toBe(5);
      expect(result.emailVerified).toBe(true);
    });
  });

  describe('List Mapping', () => {
    it('should convert list of MongoDB documents to domain entities', () => {
      // Arrange
      const mongoDocs = [mongoDoc];

      // Act
      const result = MongoUserMapper.toDomainList(mongoDocs as unknown[]);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(User);
      expect(result[0].email.value).toBe('jane.doe@company.com');
    });

    it('should convert list of domain entities to MongoDB data', () => {
      // Arrange
      const domainEntities = [domainUser];

      // Act
      const result = MongoUserMapper.toMongoList(domainEntities);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('jane.doe@company.com');
      expect(result[0]._id).toBe(domainUser.id);
    });

    it('should handle empty lists for MongoDB', () => {
      // Act
      const toDomainResult = MongoUserMapper.toDomainList([]);
      const toMongoResult = MongoUserMapper.toMongoList([]);

      // Assert
      expect(toDomainResult).toEqual([]);
      expect(toMongoResult).toEqual([]);
    });
  });

  describe('Email Value Object Handling', () => {
    it('should correctly extract email value from Value Object', () => {
      // Arrange
      const userWithComplexEmail = new User(
        new Email('COMPLEX.Email+Test@COMPANY.COM'),
        'Test User',
        UserRole.USER,
      );

      // Act
      const result = MongoUserMapper.toMongo(userWithComplexEmail);

      // Assert
      expect(result.email).toBe('complex.email+test@company.com'); // Email VO normalizes
    });
  });
});
