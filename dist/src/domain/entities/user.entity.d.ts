import { Permission, UserRole } from '../../shared/enums/user-role.enum';
import { Email } from '../value-objects/email.vo';
export declare class User {
    readonly id: string;
    readonly email: Email;
    readonly name: string;
    readonly role: UserRole;
    readonly createdAt: Date;
    readonly updatedAt?: Date;
    readonly hashedPassword?: string;
    readonly passwordChangeRequired: boolean;
    constructor(email: Email, name: string, role: UserRole, options?: {
        passwordChangeRequired?: boolean;
    });
    hasPermission(permission: Permission): boolean;
    isSuperAdmin(): boolean;
    isManager(): boolean;
    isRegularUser(): boolean;
    hasSameEmail(other: User): boolean;
    canActOnUser(targetUser: User): boolean;
    static create(email: Email, name: string, role: UserRole): User;
    static createTemporary(email: Email, name: string, role: UserRole): User;
    requirePasswordChange(): User;
    clearPasswordChangeRequirement(): User;
    private cloneWith;
    private validateName;
    private generateId;
}
