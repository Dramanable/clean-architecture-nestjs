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
    constructor(email, name, role) {
        this.validateName(name);
        this.id = this.generateId();
        this.email = email;
        this.name = name.trim();
        this.role = role;
        this.createdAt = new Date();
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
            return targetUser.isRegularUser();
        }
        return this.hasSameEmail(targetUser);
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
//# sourceMappingURL=user-new.entity.js.map