import { UserRole } from '../../shared/enums/user-role.enum';
export declare class UserEntity {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    hashedPassword?: string;
    passwordChangeRequired: boolean;
    createdAt: Date;
    updatedAt: Date;
}
