/**
 * 🧪 TESTS SIMPLES - TypeORM Repository Test
 * Tests simplifiés pour corriger les problèmes principaux
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { TOKENS } from '../../../shared/constants/injection-tokens';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { UserOrmEntity } from '../entities/typeorm/user.entity';
import { UserMapper } from '../mappers/typeorm-user.mapper';
import { TypeOrmUserRepository } from './typeorm-user.repository-simple';

describe('TypeOrmUserRepository - Simplified Tests', () => {
  let repository: TypeOrmUserRepository;
  let ormRepository: jest.Mocked<Repository<UserOrmEntity>>;
  let mapper: jest.Mocked<UserMapper>;
  let mockLogger: any;
  let mockI18n: any;

  const mockUser = new User(
    new Email('test@example.com'),
    'John Doe',
    UserRole.USER,
  );

  const mockOrmEntity: UserOrmEntity = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'John Doe',
    role: UserRole.USER,
    password: 'hashedPassword',
    passwordChangeRequired: false,
    isActive: true,
    loginAttempts: 0,
    emailVerified: true,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create mocks
    ormRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    } as any;

    mapper = {
      toDomainEntity: jest.fn(),
      toOrmEntity: jest.fn(),
    } as any;

    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };

    mockI18n = {
      t: jest.fn((key: string, params?: any) => `Translated: ${key}`),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmUserRepository,
        {
          provide: getRepositoryToken(UserOrmEntity),
          useValue: ormRepository,
        },
        {
          provide: UserMapper,
          useValue: mapper,
        },
        {
          provide: TOKENS.LOGGER,
          useValue: mockLogger,
        },
        {
          provide: TOKENS.I18N_SERVICE,
          useValue: mockI18n,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmUserRepository>(TypeOrmUserRepository);
  });

  describe('Save Operation', () => {
    it('should save user and call all dependencies correctly', async () => {
      // Arrange
      mapper.toOrmEntity.mockReturnValue(mockOrmEntity);
      ormRepository.save.mockResolvedValue(mockOrmEntity);
      mapper.toDomainEntity.mockReturnValue(mockUser);

      // Act
      const result = await repository.save(mockUser);

      // Assert
      expect(result).toBe(mockUser);
      expect(mapper.toOrmEntity).toHaveBeenCalledWith(mockUser);
      expect(ormRepository.save).toHaveBeenCalledWith(mockOrmEntity);
      expect(mapper.toDomainEntity).toHaveBeenCalledWith(mockOrmEntity);
      expect(mockI18n.t).toHaveBeenCalledWith(
        'operations.user.save_attempt',
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email.value,
        }),
      );
      expect(mockI18n.t).toHaveBeenCalledWith(
        'success.user.saved',
        expect.objectContaining({
          userId: mockUser.id,
          email: mockUser.email.value,
        }),
      );
    });
  });

  describe('Find Operations', () => {
    it('should find user by ID', async () => {
      // Arrange
      ormRepository.findOne.mockResolvedValue(mockOrmEntity);
      mapper.toDomainEntity.mockReturnValue(mockUser);

      // Act
      const result = await repository.findById('user-123');

      // Assert
      expect(result).toBe(mockUser);
      expect(ormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(mapper.toDomainEntity).toHaveBeenCalledWith(mockOrmEntity);
    });

    it('should return null when user not found', async () => {
      // Arrange
      ormRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.findById('non-existent');

      // Assert
      expect(result).toBeNull();
      expect(mockI18n.t).toHaveBeenCalledWith('info.user.not_found', {
        userId: 'non-existent',
      });
    });
  });

  describe('Count Operations', () => {
    it('should count super admins', async () => {
      // Arrange
      ormRepository.count.mockResolvedValue(5);

      // Act
      const result = await repository.countSuperAdmins();

      // Assert
      expect(result).toBe(5);
      expect(ormRepository.count).toHaveBeenCalledWith({
        where: { role: UserRole.SUPER_ADMIN },
      });
    });

    it('should check if email exists', async () => {
      // Arrange
      const email = new Email('test@example.com');
      ormRepository.count.mockResolvedValue(1);

      // Act
      const result = await repository.emailExists(email);

      // Assert
      expect(result).toBe(true);
      expect(ormRepository.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('Pagination', () => {
    it('should return paginated results', async () => {
      // Arrange
      const mockOrmEntities = [mockOrmEntity];
      ormRepository.findAndCount.mockResolvedValue([mockOrmEntities, 25]);
      mapper.toDomainEntity.mockReturnValue(mockUser);

      // Act
      const result = await repository.findAll({ page: 2, limit: 10 });

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.totalItems).toBe(25);
      expect(result.meta.totalPages).toBe(3);
      expect(ormRepository.findAndCount).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        order: { createdAt: 'DESC' },
      });
    });
  });
});
