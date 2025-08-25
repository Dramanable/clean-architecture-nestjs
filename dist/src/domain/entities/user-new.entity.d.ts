import { Email } from '../value-objects/email.vo';
import { UserRole, Permission } from '../../shared/enums/user-role.enum';
export declare class User {
    readonly id: string;
    readonly email: Email;
    readonly name: string;
    readonly role: UserRole;
    readonly createdAt: Date;
    constructor(email: Email, name: string, role: UserRole);
    hasPermission(permission: Permission): boolean;
    isSuperAdmin(): boolean;
    isManager(): boolean;
    isRegularUser(): boolean;
    hasSameEmail(other: User): boolean;
    canActOnUser(targetUser: User): boolean;
    private validateName;
    private generateId;
}
