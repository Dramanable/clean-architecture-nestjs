/**
 * 🧪 TESTS - TypeORM User Repository avec i18n
 *
 * Tests d'intégration pour le repository TypeORM
 * Validation de l'intégration i18n et logging
 */

import { Repository } from 'typeorm';
import { I18nService } from '../../../application/ports/i18n.port';
import { Logger } from '../../../application/ports/logger.port';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { UserOrmEntity } from '../entities/typeorm/user.entity';
import { UserMapper } from '../mappers/typeorm-user.mapper';
import { TypeOrmUserRepository } from './typeorm-user.repository-simple';

describe('TypeOrmUserRepository avec i18n', () => {
  let repository: TypeOrmUserRepository;
  let mockOrmRepository: jest.Mocked<Repository<UserOrmEntity>>;
  let mockMapper: jest.Mocked<UserMapper>;
  let mockLogger: any;
  let mockI18n: any;

  const mockUser = new User(
    new Email('test@example.com'),
    'John Doe',
    UserRole.USER,
  );

  const mockOrmEntity: UserOrmEntity = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USER,
    password: 'hashedPassword123',
    passwordChangeRequired: false,
    isActive: true,
    loginAttempts: 0,
    emailVerified: false,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserOrmEntity;

  beforeEach(() => {
    // Mock TypeORM Repository
    mockOrmRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    } as any;

    // Mock UserMapper
    mockMapper = {
      toDomainEntity: jest.fn(),
      toOrmEntity: jest.fn(),
    } as any;

    // Mock Logger
    mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };

    // Mock I18n Service avec traductions françaises
    mockI18n = {
      t: jest.fn((key: string, params?: any) => {
        const translations: Record<string, string> = {
          'operations.user.save_attempt': `Tentative de sauvegarde de l'utilisateur ${params?.userId || 'N/A'} (${params?.email || 'N/A'})`,
          'success.user.saved': `Utilisateur ${params?.userId || 'N/A'} (${params?.email || 'N/A'}) sauvegardé avec succès`,
          'operations.user.find_by_id_attempt': `Recherche de l'utilisateur ${params?.userId || 'N/A'}`,
          'info.user.not_found': `Utilisateur ${params?.userId || 'N/A'} non trouvé`,
          'success.user.found': `Utilisateur ${params?.userId || 'N/A'} (${params?.email || 'N/A'}) trouvé`,
          'errors.user.save_failed': `Échec de la sauvegarde de l'utilisateur ${params?.userId || 'N/A'} : ${params?.error || 'Erreur inconnue'}`,
        };
        return translations[key] || key;
      }),
    };

    repository = new TypeOrmUserRepository(
      mockOrmRepository,
      mockMapper,
      mockLogger as Logger,
      mockI18n as I18nService,
    );
  });

  describe('🌍 Intégration i18n', () => {
    it('should log save attempt with French translation', async () => {
      // Arrange
      mockMapper.toOrmEntity.mockReturnValue(mockOrmEntity);
      mockOrmRepository.save.mockResolvedValue(mockOrmEntity);
      mockMapper.toDomainEntity.mockReturnValue(mockUser);

      // Act
      await repository.save(mockUser);

      // Assert
      expect(mockI18n.t).toHaveBeenCalledWith('operations.user.save_attempt', {
        userId: mockUser.id,
        email: mockUser.email.value,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Tentative de sauvegarde de l'utilisateur"),
        { operation: 'UserRepository.save', userId: mockUser.id },
      );
    });

    it('should log success message with French translation', async () => {
      // Arrange
      mockMapper.toOrmEntity.mockReturnValue(mockOrmEntity);
      mockOrmRepository.save.mockResolvedValue(mockOrmEntity);
      mockMapper.toDomainEntity.mockReturnValue(mockUser);

      // Act
      await repository.save(mockUser);

      // Assert
      expect(mockI18n.t).toHaveBeenCalledWith('success.user.saved', {
        userId: mockUser.id,
        email: mockUser.email.value,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('sauvegardé avec succès'),
        { operation: 'UserRepository.save', userId: mockUser.id },
      );
    });

    it('should log error with French translation when save fails', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      mockMapper.toOrmEntity.mockReturnValue(mockOrmEntity);
      mockOrmRepository.save.mockRejectedValue(error);

      // Act & Assert
      await expect(repository.save(mockUser)).rejects.toThrow(error);

      expect(mockI18n.t).toHaveBeenCalledWith('errors.user.save_failed', {
        userId: mockUser.id,
        error: 'Database connection failed',
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Échec de la sauvegarde'),
        error,
        { operation: 'UserRepository.save', userId: mockUser.id },
      );
    });

    it('should use i18n for not found messages', async () => {
      // Arrange
      mockOrmRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await repository.findById('non-existent-id');

      // Assert
      expect(result).toBeNull();
      expect(mockI18n.t).toHaveBeenCalledWith('info.user.not_found', {
        userId: 'non-existent-id',
      });
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Utilisateur non-existent-id non trouvé'),
        { operation: 'UserRepository.findById', userId: 'non-existent-id' },
      );
    });
  });

  describe('🔍 Repository Operations', () => {
    it('should save user successfully with logging', async () => {
      // Arrange
      mockMapper.toOrmEntity.mockReturnValue(mockOrmEntity);
      mockOrmRepository.save.mockResolvedValue(mockOrmEntity);
      mockMapper.toDomainEntity.mockReturnValue(mockUser);

      // Act
      const result = await repository.save(mockUser);

      // Assert
      expect(result).toBe(mockUser);
      expect(mockMapper.toOrmEntity).toHaveBeenCalledWith(mockUser);
      expect(mockOrmRepository.save).toHaveBeenCalledWith(mockOrmEntity);
      expect(mockMapper.toDomainEntity).toHaveBeenCalledWith(mockOrmEntity);

      // Vérify logging sequence
      expect(mockLogger.info).toHaveBeenCalledTimes(2); // attempt + success
    });

    it('should find user by ID with logging', async () => {
      // Arrange
      mockOrmRepository.findOne.mockResolvedValue(mockOrmEntity);
      mockMapper.toDomainEntity.mockReturnValue(mockUser);

      // Act
      const result = await repository.findById('user-123');

      // Assert
      expect(result).toBe(mockUser);
      expect(mockOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(mockMapper.toDomainEntity).toHaveBeenCalledWith(mockOrmEntity);
      expect(mockLogger.debug).toHaveBeenCalledTimes(2); // attempt + success
    });

    it('should count super admins', async () => {
      // Arrange
      mockOrmRepository.count.mockResolvedValue(3);

      // Act
      const result = await repository.countSuperAdmins();

      // Assert
      expect(result).toBe(3);
      expect(mockOrmRepository.count).toHaveBeenCalledWith({
        where: { role: UserRole.SUPER_ADMIN },
      });
    });

    it('should check if email exists', async () => {
      // Arrange
      const email = new Email('existing@example.com');
      mockOrmRepository.count.mockResolvedValue(1);

      // Act
      const result = await repository.emailExists(email);

      // Assert
      expect(result).toBe(true);
      expect(mockOrmRepository.count).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
      });
    });
  });

  describe('📋 Pagination', () => {
    it('should return paginated results with metadata', async () => {
      // Arrange
      const mockOrmEntities = [mockOrmEntity];
      const totalItems = 25;
      mockOrmRepository.findAndCount.mockResolvedValue([
        mockOrmEntities,
        totalItems,
      ]);
      mockMapper.toDomainEntity.mockReturnValue(mockUser);

      // Act
      const result = await repository.findAll({ page: 2, limit: 10 });

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.totalItems).toBe(25);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);

      expect(mockOrmRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 10, // (page - 1) * limit
        take: 10,
      });

      // Verify i18n logging for pagination
      expect(mockI18n.t).toHaveBeenCalledWith(
        'operations.user.find_all_attempt',
        { page: 2, limit: 10 },
      );
    });
  });

  describe('⚠️ Error Handling', () => {
    it('should handle database errors gracefully with i18n', async () => {
      // Arrange
      const dbError = new Error('Connection timeout');
      mockMapper.toOrmEntity.mockReturnValue(mockOrmEntity);
      mockOrmRepository.save.mockRejectedValue(dbError);

      // Act & Assert
      await expect(repository.save(mockUser)).rejects.toThrow(dbError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Échec de la sauvegarde'),
        dbError,
        { operation: 'UserRepository.save', userId: mockUser.id },
      );
    });
  });
});
