import { UserRole } from '../../shared/enums/user-role.enum';
export declare class UserResponseDto {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt?: Date;
    passwordChangeRequired: boolean;
}
export declare class UserDetailResponseDto extends UserResponseDto {
    emailVerified: boolean;
    lastLoginAt?: Date;
    failedLoginAttempts?: number;
}
export declare class PaginatedUserResponseDto {
    data: UserResponseDto[];
    meta: {
        currentPage: number;
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}
