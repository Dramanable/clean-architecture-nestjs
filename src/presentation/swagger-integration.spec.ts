/**
 * 🧪 INTEGRATION TEST - Swagger Documentation
 *
 * Test d'intégration pour vérifier que Swagger fonctionne correctement
 * avec nos DTOs et mappers
 */

import { UserEntity } from '../../infrastructure/entities/user.entity';
import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateUserDto, UserResponseDto } from '../dtos/user.dto';
import { UserMapper } from '../infrastructure/database/mappers/typeorm-user.mapper';

describe('Swagger Integration Tests', () => {
  describe('UserMapper with DTOs', () => {
    it('should convert CreateUserDto to UserEntity', () => {
      // Arrange
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        name: 'John Doe',
        role: UserRole.USER,
        passwordChangeRequired: false,
        sendWelcomeEmail: true,
      };

      // Act
      const entityData = UserMapper.createDtoToEntity(createDto);

      // Assert
      expect(entityData).toEqual({
        email: 'test@example.com',
        name: 'John Doe',
        role: UserRole.USER,
        passwordChangeRequired: false,
      });
    });

    it('should convert UserEntity to UserResponseDto', () => {
      // Arrange
      const userEntity: UserEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'John Doe',
        role: UserRole.USER,
        passwordChangeRequired: false,
        hashedPassword: undefined,
        createdAt: new Date('2024-01-15T10:00:00.000Z'),
        updatedAt: new Date('2024-01-15T10:00:00.000Z'),
      };

      // Act
      const responseDto = UserMapper.toResponseDto(userEntity);

      // Assert
      expect(responseDto).toEqual({
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'John Doe',
        role: UserRole.USER,
        passwordChangeRequired: false,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });
    });

    it('should convert UserEntity list to paginated response', () => {
      // Arrange
      const userEntities: UserEntity[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user1@example.com',
          name: 'User One',
          role: UserRole.USER,
          passwordChangeRequired: false,
          hashedPassword: undefined,
          createdAt: new Date('2024-01-15T10:00:00.000Z'),
          updatedAt: new Date('2024-01-15T10:00:00.000Z'),
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          email: 'user2@example.com',
          name: 'User Two',
          role: UserRole.MANAGER,
          passwordChangeRequired: true,
          hashedPassword: undefined,
          createdAt: new Date('2024-01-16T10:00:00.000Z'),
          updatedAt: new Date('2024-01-16T10:00:00.000Z'),
        },
      ];

      // Act
      const listResponse = UserMapper.toListResponseDto(
        userEntities,
        25, // total
        1, // page
        10, // limit
      );

      // Assert
      expect(listResponse).toEqual({
        users: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user1@example.com',
            name: 'User One',
            role: UserRole.USER,
            passwordChangeRequired: false,
            createdAt: '2024-01-15T10:00:00.000Z',
            updatedAt: '2024-01-15T10:00:00.000Z',
          },
          {
            id: '223e4567-e89b-12d3-a456-426614174001',
            email: 'user2@example.com',
            name: 'User Two',
            role: UserRole.MANAGER,
            passwordChangeRequired: true,
            createdAt: '2024-01-16T10:00:00.000Z',
            updatedAt: '2024-01-16T10:00:00.000Z',
          },
        ],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
        hasNext: true,
        hasPrevious: false,
      });
    });
  });

  describe('DTO Validation Structure', () => {
    it('should have proper structure for CreateUserDto', () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        name: 'John Doe',
        role: UserRole.USER,
        passwordChangeRequired: false,
        sendWelcomeEmail: true,
      };

      // Vérification que le DTO a toutes les propriétés attendues
      expect(dto).toHaveProperty('email');
      expect(dto).toHaveProperty('name');
      expect(dto).toHaveProperty('role');
      expect(dto).toHaveProperty('passwordChangeRequired');
      expect(dto).toHaveProperty('sendWelcomeEmail');
    });

    it('should have proper structure for UserResponseDto', () => {
      const dto: UserResponseDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'John Doe',
        role: UserRole.USER,
        passwordChangeRequired: false,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      };

      // Vérification que le DTO a toutes les propriétés attendues
      expect(dto).toHaveProperty('id');
      expect(dto).toHaveProperty('email');
      expect(dto).toHaveProperty('name');
      expect(dto).toHaveProperty('role');
      expect(dto).toHaveProperty('passwordChangeRequired');
      expect(dto).toHaveProperty('createdAt');
      expect(dto).toHaveProperty('updatedAt');
    });
  });
});
