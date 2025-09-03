/**
 * 🧪 TypeOrmUserRepository - TDD Tests
 *
 * Tests unitaires pour le repository TypeORM User
 * Approche TDD avec mocks TypeORM appropriés
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import { UserOrmEntity } from '../entities/typeorm/user.entity';
import { UserMapper } from '../mappers/typeorm-user.mapper';
import { TypeOrmUserRepository } from './typeorm-user.repository';

describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let ormRepository: jest.Mocked<Repository<UserOrmEntity>>;
  let mapper: jest.Mocked<UserMapper>;

  beforeEach(async () => {
    // Mocks typés pour TypeORM Repository
    const mockOrmRepository: jest.Mocked<Repository<UserOrmEntity>> = {
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      // Ajout d'autres méthodes si nécessaires
    } as unknown as jest.Mocked<Repository<UserOrmEntity>>;

    // Mock typé pour UserMapper
    const mockMapper: jest.Mocked<UserMapper> = {
      toDomainEntity: jest.fn(),
      toOrmEntity: jest.fn(),
    } as jest.Mocked<UserMapper>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmUserRepository,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: mockOrmRepository,
        },
        {
          provide: TOKENS.USER_MAPPER,
          useValue: mockMapper,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository);
    ormRepository = module.get(getRepositoryToken(UserOrmEntity));
    mapper = module.get(TOKENS.USER_MAPPER);
  });

  describe('findByEmail', () => {
    describe('Success Cases', () => {
      it('should return domain user when ORM entity found', async () => {
        // Arrange - TDD Phase RED
        const email = new Email('test@admin.com');
        const mockOrmEntity: UserOrmEntity = {
          id: 'test-user-id',
          email: 'test@admin.com',
          name: 'Test User',
          hashedPassword: '$2b$12$hash',
          role: UserRole.SUPER_ADMIN,
          isActive: true,
          passwordChangeRequired: false,
          loginAttempts: 0,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        } as UserOrmEntity;

        const mockDomainUser = User.createWithHashedPassword(
          'test-user-id',
          email,
          'Test User',
          UserRole.SUPER_ADMIN,
          '$2b$12$hash',
          new Date(),
          new Date(),
          false,
        );

        // Setup mocks
        ormRepository.findOne.mockResolvedValue(mockOrmEntity);
        mapper.toDomainEntity.mockReturnValue(mockDomainUser);

        // Act
        const result = await repository.findByEmail(email);

        // Assert
        expect(result).toBe(mockDomainUser);
        expect(ormRepository.findOne).toHaveBeenCalledWith({
          where: { email: 'test@admin.com' },
        });
        expect(mapper.toDomainEntity).toHaveBeenCalledWith(mockOrmEntity);
      });

      it('should handle email value object correctly', async () => {
        // Arrange - TDD Phase RED pour validation des paramètres
        const email = new Email('user@domain.com');

        // Setup mocks
        ormRepository.findOne.mockResolvedValue(null);

        // Act
        await repository.findByEmail(email);

        // Assert - Vérifie que email.value est utilisé correctement
        expect(ormRepository.findOne).toHaveBeenCalledWith({
          where: { email: 'user@domain.com' },
        });
      });
    });

    describe('Not Found Cases', () => {
      it('should return null when no ORM entity found', async () => {
        // Arrange - TDD Phase RED
        const email = new Email('nonexistent@example.com');

        // Setup mocks
        ormRepository.findOne.mockResolvedValue(null);

        // Act
        const result = await repository.findByEmail(email);

        // Assert
        expect(result).toBeNull();
        expect(ormRepository.findOne).toHaveBeenCalledWith({
          where: { email: 'nonexistent@example.com' },
        });
        expect(mapper.toDomainEntity).not.toHaveBeenCalled();
      });
    });

    describe('Error Handling', () => {
      it('should propagate database errors', async () => {
        // Arrange - TDD Phase RED pour gestion d'erreurs
        const email = new Email('test@example.com');
        const dbError = new Error('Database connection failed');

        // Setup mocks
        ormRepository.findOne.mockRejectedValue(dbError);

        // Act & Assert
        await expect(repository.findByEmail(email)).rejects.toThrow(
          'Database connection failed',
        );
        expect(ormRepository.findOne).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
        });
        expect(mapper.toDomainEntity).not.toHaveBeenCalled();
      });
    });
  });

  describe('findById', () => {
    describe('Success Cases', () => {
      it('should return domain user when ORM entity found', async () => {
        // Arrange
        const userId = 'test-user-id';
        const mockOrmEntity: UserOrmEntity = {
          id: userId,
          email: 'test@example.com',
          name: 'Test User',
          hashedPassword: '$2b$12$hash',
          role: UserRole.USER,
          isActive: true,
          passwordChangeRequired: false,
          loginAttempts: 0,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1,
        } as UserOrmEntity;

        const mockDomainUser = User.createWithHashedPassword(
          userId,
          new Email('test@example.com'),
          'Test User',
          UserRole.USER,
          '$2b$12$hash',
          new Date(),
          new Date(),
          false,
        );

        // Setup mocks
        ormRepository.findOne.mockResolvedValue(mockOrmEntity);
        mapper.toDomainEntity.mockReturnValue(mockDomainUser);

        // Act
        const result = await repository.findById(userId);

        // Assert
        expect(result).toBe(mockDomainUser);
        expect(ormRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
        });
        expect(mapper.toDomainEntity).toHaveBeenCalledWith(mockOrmEntity);
      });
    });

    describe('Not Found Cases', () => {
      it('should return null when no ORM entity found', async () => {
        // Arrange
        const userId = 'nonexistent-id';

        // Setup mocks
        ormRepository.findOne.mockResolvedValue(null);

        // Act
        const result = await repository.findById(userId);

        // Assert
        expect(result).toBeNull();
        expect(ormRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
        });
        expect(mapper.toDomainEntity).not.toHaveBeenCalled();
      });
    });
  });

  describe('save', () => {
    it('should save domain entity and return mapped result', async () => {
      // Arrange
      const domainUser = User.create(
        new Email('new@example.com'),
        'New User',
        UserRole.USER,
      );

      const ormEntity: UserOrmEntity = {
        id: 'generated-id',
        email: 'new@example.com',
        name: 'New User',
        hashedPassword: 'hashed-password',
        role: UserRole.USER,
        isActive: true,
        passwordChangeRequired: false,
        loginAttempts: 0,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1,
      } as UserOrmEntity;

      const savedOrmEntity = { ...ormEntity, id: 'saved-id' };
      const savedDomainUser = User.createWithHashedPassword(
        'saved-id',
        new Email('new@example.com'),
        'New User',
        UserRole.USER,
        'hashed-password',
        new Date(),
        new Date(),
        false,
      );

      // Setup mocks
      mapper.toOrmEntity.mockReturnValue(ormEntity);
      ormRepository.save.mockResolvedValue(savedOrmEntity);
      mapper.toDomainEntity.mockReturnValue(savedDomainUser);

      // Act
      const result = await repository.save(domainUser);

      // Assert
      expect(result).toBe(savedDomainUser);
      expect(mapper.toOrmEntity).toHaveBeenCalledWith(domainUser);
      expect(ormRepository.save).toHaveBeenCalledWith(ormEntity);
      expect(mapper.toDomainEntity).toHaveBeenCalledWith(savedOrmEntity);
    });
  });
});
