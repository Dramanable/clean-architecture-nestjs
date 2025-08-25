"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = exports.Permission = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["USER"] = "USER";
})(UserRole || (exports.UserRole = UserRole = {}));
var Permission;
(function (Permission) {
    Permission["CREATE_USER"] = "CREATE_USER";
    Permission["UPDATE_USER"] = "UPDATE_USER";
    Permission["DELETE_USER"] = "DELETE_USER";
    Permission["VIEW_USER"] = "VIEW_USER";
    Permission["VIEW_ALL_USERS"] = "VIEW_ALL_USERS";
    Permission["MANAGE_TEAM"] = "MANAGE_TEAM";
    Permission["VIEW_REPORTS"] = "VIEW_REPORTS";
    Permission["MANAGE_SYSTEM"] = "MANAGE_SYSTEM";
    Permission["MANAGE_ROLES"] = "MANAGE_ROLES";
    Permission["ACCESS_ADMIN_PANEL"] = "ACCESS_ADMIN_PANEL";
})(Permission || (exports.Permission = Permission = {}));
exports.ROLE_PERMISSIONS = {
    [UserRole.SUPER_ADMIN]: [
        Permission.CREATE_USER,
        Permission.UPDATE_USER,
        Permission.DELETE_USER,
        Permission.VIEW_USER,
        Permission.VIEW_ALL_USERS,
        Permission.MANAGE_TEAM,
        Permission.VIEW_REPORTS,
        Permission.MANAGE_SYSTEM,
        Permission.MANAGE_ROLES,
        Permission.ACCESS_ADMIN_PANEL
    ],
    [UserRole.MANAGER]: [
        Permission.CREATE_USER,
        Permission.UPDATE_USER,
        Permission.VIEW_USER,
        Permission.VIEW_ALL_USERS,
        Permission.MANAGE_TEAM,
        Permission.VIEW_REPORTS
    ],
    [UserRole.USER]: [
        Permission.VIEW_USER,
        Permission.UPDATE_USER
    ]
};
//# sourceMappingURL=user-role.enum.js.map