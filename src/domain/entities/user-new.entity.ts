/**
 * 🏛️ DOMAIN ENTITY - User avec Système de Rôles
 *
 * Entité métier pure représentant un utilisateur avec rôles et permissions.
 * Contient la logique métier et les règles de validation.
 *
 * PRINCIPES CLEAN ARCHITECTURE :
 * - Pas de dépendance vers l'infrastructure
 * - Logique métier pure avec système de permissions
 * - Entité auto-validante avec Email Value Object
 */

import { Email } from '../value-objects/email.vo';
import {
  UserRole,
  Permission,
  ROLE_PERMISSIONS,
} from '../../shared/enums/user-role.enum';

export class User {
  public readonly id: string;
  public readonly email: Email;
  public readonly name: string;
  public readonly role: UserRole;
  public readonly createdAt: Date;

  constructor(email: Email, name: string, role: UserRole) {
    this.validateName(name);

    this.id = this.generateId();
    this.email = email;
    this.name = name.trim();
    this.role = role;
    this.createdAt = new Date();
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  hasPermission(permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[this.role];
    return rolePermissions.includes(permission);
  }

  /**
   * Vérifie si l'utilisateur est super admin
   */
  isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  /**
   * Vérifie si l'utilisateur est manager
   */
  isManager(): boolean {
    return this.role === UserRole.MANAGER;
  }

  /**
   * Vérifie si l'utilisateur est un utilisateur basique
   */
  isRegularUser(): boolean {
    return this.role === UserRole.USER;
  }

  /**
   * Compare les emails de deux utilisateurs
   */
  hasSameEmail(other: User): boolean {
    return this.email.equals(other.email);
  }

  /**
   * Peut-il effectuer une action sur un autre utilisateur ?
   * Règles métier :
   * - Super admin peut tout faire
   * - Manager peut agir sur les users réguliers
   * - User ne peut agir que sur lui-même
   */
  canActOnUser(targetUser: User): boolean {
    if (this.isSuperAdmin()) {
      return true; // Super admin peut tout
    }

    if (this.isManager()) {
      return targetUser.isRegularUser(); // Manager peut agir sur users uniquement
    }

    return this.hasSameEmail(targetUser); // User peut agir que sur lui-même
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
  }

  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
