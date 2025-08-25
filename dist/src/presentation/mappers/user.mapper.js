"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
class UserMapper {
    static createDtoToEntity(dto) {
        return {
            email: dto.email,
            name: dto.name,
            role: dto.role,
            passwordChangeRequired: dto.passwordChangeRequired ?? false,
        };
    }
    static updateDtoToEntityData(dto) {
        const entityData = {};
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
    static toResponseDto(entity) {
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
    static toListResponseDto(entities, total, page, limit) {
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
exports.UserMapper = UserMapper;
//# sourceMappingURL=user.mapper.js.map