"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const user_role_enum_1 = require("../../shared/enums/user-role.enum");
class User {
    id;
    email;
    name;
    role;
    createdAt;
    updatedAt;
    hashedPassword;
    passwordChangeRequired;
    constructor(email, name, role, options) {
        this.validateName(name);
        this.id = this.generateId();
        this.email = email;
        this.name = name.trim();
        this.role = role;
        this.createdAt = new Date();
        this.passwordChangeRequired = options?.passwordChangeRequired ?? false;
    }
    hasPermission(permission) {
        const rolePermissions = user_role_enum_1.ROLE_PERMISSIONS[this.role];
        return rolePermissions.includes(permission);
    }
    isSuperAdmin() {
        return this.role === user_role_enum_1.UserRole.SUPER_ADMIN;
    }
    isManager() {
        return this.role === user_role_enum_1.UserRole.MANAGER;
    }
    isRegularUser() {
        return this.role === user_role_enum_1.UserRole.USER;
    }
    hasSameEmail(other) {
        return this.email.equals(other.email);
    }
    canActOnUser(targetUser) {
        if (this.isSuperAdmin()) {
            return true;
        }
        if (this.isManager()) {
            return targetUser.isRegularUser() || this.hasSameEmail(targetUser);
        }
        return this.hasSameEmail(targetUser);
    }
    static create(email, name, role) {
        return new User(email, name, role);
    }
    static createTemporary(email, name, role) {
        return new User(email, name, role, { passwordChangeRequired: true });
    }
    requirePasswordChange() {
        if (this.passwordChangeRequired) {
            return this;
        }
        return this.cloneWith({ passwordChangeRequired: true });
    }
    clearPasswordChangeRequirement() {
        if (!this.passwordChangeRequired) {
            return this;
        }
        return this.cloneWith({ passwordChangeRequired: false });
    }
    cloneWith(changes) {
        const newUser = new User(this.email, this.name, this.role, {
            passwordChangeRequired: changes.passwordChangeRequired ?? this.passwordChangeRequired,
        });
        Object.assign(newUser, {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: new Date(),
            hashedPassword: this.hashedPassword,
        });
        return newUser;
    }
    validateName(name) {
        if (!name || name.trim().length === 0) {
            throw new Error('Name cannot be empty');
        }
    }
    generateId() {
        return (Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15));
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map