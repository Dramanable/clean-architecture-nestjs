/**
 * 🏛️ DOMAIN ENUMS - User Roles & Permissions
 *
 * Définit les rôles et permissions dans le système
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export enum Permission {
  // User management
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  VIEW_USER = 'VIEW_USER',
  VIEW_ALL_USERS = 'VIEW_ALL_USERS',

  // Manager permissions
  MANAGE_TEAM = 'MANAGE_TEAM',
  VIEW_REPORTS = 'VIEW_REPORTS',

  // Super admin permissions
  MANAGE_SYSTEM = 'MANAGE_SYSTEM',
  MANAGE_ROLES = 'MANAGE_ROLES',
  ACCESS_ADMIN_PANEL = 'ACCESS_ADMIN_PANEL',
}

/**
 * Mapping des rôles vers leurs permissions
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Super admin peut tout faire
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.VIEW_USER,
    Permission.VIEW_ALL_USERS,
    Permission.MANAGE_TEAM,
    Permission.VIEW_REPORTS,
    Permission.MANAGE_SYSTEM,
    Permission.MANAGE_ROLES,
    Permission.ACCESS_ADMIN_PANEL,
  ],

  [UserRole.MANAGER]: [
    // Manager peut gérer son équipe
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.VIEW_USER,
    Permission.VIEW_ALL_USERS,
    Permission.MANAGE_TEAM,
    Permission.VIEW_REPORTS,
  ],

  [UserRole.USER]: [
    // User basique peut seulement voir son profil
    Permission.VIEW_USER,
    Permission.UPDATE_USER, // Son propre profil seulement
  ],
};
