import { UserOrmEntity } from '../../infrastructure/database/entities/typeorm/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UserListResponseDto,
  UserResponseDto,
} from '../dtos/user.dto';

/**
 * 🔄 MAPPER - User Infrastructure Entity to DTO Mapping
 *
 * Responsable de la conversion entre entités infrastructure et DTOs
 * Maintient la séparation entre les couches présentation et infrastructure
 */
export class UserMapper {
  /**
   * Convertit un DTO de création en entité infrastructure
   */
  static createDtoToEntity(dto: CreateUserDto): Partial<UserOrmEntity> {
    return {
      email: dto.email,
      name: dto.name,
      role: dto.role,
      passwordChangeRequired: dto.passwordChangeRequired ?? false,
    };
  }

  /**
   * Convertit un DTO de mise à jour en données pour l'entité infrastructure
   */
  static updateDtoToEntityData(dto: UpdateUserDto): Partial<UserOrmEntity> {
    const entityData: Partial<UserOrmEntity> = {};

    if (dto.name !== undefined) {
      entityData.name = dto.name;
    }

    if (dto.role !== undefined) {
      entityData.role = dto.role;
    }

    if (dto.passwordChangeRequired !== undefined) {
      entityData.passwordChangeRequired = dto.passwordChangeRequired;
    }

    return entityData;
  }

  /**
   * Convertit une entité infrastructure en DTO de réponse
   */
  static toResponseDto(entity: UserOrmEntity): UserResponseDto {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      role: entity.role,
      passwordChangeRequired: entity.passwordChangeRequired,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  /**
   * Convertit une liste d'entités infrastructure en DTO de liste avec pagination
   */
  static toListResponseDto(
    entities: UserOrmEntity[],
    total: number,
    page: number,
    limit: number,
  ): UserListResponseDto {
    const totalPages = Math.ceil(total / limit);

    return {
      users: entities.map((entity) => this.toResponseDto(entity)),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }
}
