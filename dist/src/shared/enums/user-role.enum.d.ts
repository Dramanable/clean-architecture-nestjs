export declare enum UserRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    MANAGER = "MANAGER",
    USER = "USER"
}
export declare enum Permission {
    CREATE_USER = "CREATE_USER",
    UPDATE_USER = "UPDATE_USER",
    DELETE_USER = "DELETE_USER",
    VIEW_USER = "VIEW_USER",
    VIEW_ALL_USERS = "VIEW_ALL_USERS",
    MANAGE_TEAM = "MANAGE_TEAM",
    VIEW_REPORTS = "VIEW_REPORTS",
    MANAGE_SYSTEM = "MANAGE_SYSTEM",
    MANAGE_ROLES = "MANAGE_ROLES",
    ACCESS_ADMIN_PANEL = "ACCESS_ADMIN_PANEL"
}
export declare const ROLE_PERMISSIONS: Record<UserRole, Permission[]>;
