import { UserRole } from '../../shared/enums/user-role.enum';
export declare class CreateUserDto {
    email: string;
    name: string;
    role: UserRole;
    passwordChangeRequired?: boolean;
    sendWelcomeEmail?: boolean;
}
export declare class UpdateUserDto {
    name?: string;
    role?: UserRole;
    passwordChangeRequired?: boolean;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    passwordChangeRequired: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare class UserListResponseDto {
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}
