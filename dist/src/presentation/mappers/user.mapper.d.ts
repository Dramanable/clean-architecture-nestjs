import { UserEntity } from '../../infrastructure/entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserListResponseDto, UserResponseDto } from '../dtos/user.dto';
export declare class UserMapper {
    static createDtoToEntity(dto: CreateUserDto): Partial<UserEntity>;
    static updateDtoToEntityData(dto: UpdateUserDto): Partial<UserEntity>;
    static toResponseDto(entity: UserEntity): UserResponseDto;
    static toListResponseDto(entities: UserEntity[], total: number, page: number, limit: number): UserListResponseDto;
}
