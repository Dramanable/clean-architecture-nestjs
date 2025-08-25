import { UserRole } from '../../../../shared/enums/user-role.enum';
export declare class UserOrmEntity {
    id: string;
    email: string;
    name: string;
    password: string;
    passwordChangeRequired: boolean;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    lastLoginIp?: string;
    loginAttempts: number;
    lockedUntil?: Date;
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    emailVerificationToken?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    tenantId?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
