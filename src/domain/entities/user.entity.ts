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

import {
  Permission,
  ROLE_PERMISSIONS,
  UserRole,
} from '../../shared/enums/user-role.enum';
import { Email } from '../value-objects/email.vo';

export class User {
  public readonly id: string;
  public readonly email: Email;
  public readonly name: string;
  public readonly role: UserRole;
  public readonly createdAt: Date;
  public readonly updatedAt?: Date;
  public readonly hashedPassword?: string; // Hash du mot de passe pour l'authentification
  public readonly passwordChangeRequired: boolean; // Indique si l'utilisateur doit changer son mot de passe

  constructor(
    email: Email,
    name: string,
    role: UserRole,
    options?: { passwordChangeRequired?: boolean },
  ) {
    this.validateName(name);

    this.id = this.generateId();
    this.email = email;
    this.name = name.trim();
    this.role = role;
    this.createdAt = new Date();
    this.passwordChangeRequired = options?.passwordChangeRequired ?? false;
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
   * - Manager peut agir sur les users réguliers + lui-même
   * - User ne peut agir que sur lui-même
   */
  canActOnUser(targetUser: User): boolean {
    if (this.isSuperAdmin()) {
      return true; // Super admin peut tout
    }

    if (this.isManager()) {
      return targetUser.isRegularUser() || this.hasSameEmail(targetUser);
    }

    return this.hasSameEmail(targetUser); // User peut agir que sur lui-même
  }

  /**
   * Factory method pour créer un utilisateur standard
   */
  static create(email: Email, name: string, role: UserRole): User {
    return new User(email, name, role);
  }

  /**
   * Factory method pour créer un utilisateur avec mot de passe hashé (pour le mapping ORM)
   */
  static createWithHashedPassword(
    id: string,
    email: Email,
    name: string,
    role: UserRole,
    hashedPassword: string,
    createdAt: Date,
    updatedAt?: Date,
    passwordChangeRequired?: boolean,
  ): User {
    const user = new User(email, name, role, { passwordChangeRequired });

    // Assignment des propriétés readonly via Object.assign
    Object.assign(user, {
      id,
      hashedPassword,
      createdAt,
      updatedAt,
    });

    return user;
  }

  /**
   * Crée un utilisateur temporaire qui doit changer son mot de passe
   */
  static createTemporary(email: Email, name: string, role: UserRole): User {
    return new User(email, name, role, { passwordChangeRequired: true });
  }

  /**
   * Force l'utilisateur à changer son mot de passe
   * Retourne un nouvel utilisateur avec passwordChangeRequired = true
   */
  requirePasswordChange(): User {
    if (this.passwordChangeRequired) {
      return this; // Déjà requis, retourne l'instance actuelle
    }

    return this.cloneWith({ passwordChangeRequired: true });
  }

  /**
   * Supprime l'exigence de changement de mot de passe
   * Retourne un nouvel utilisateur avec passwordChangeRequired = false
   */
  clearPasswordChangeRequirement(): User {
    if (!this.passwordChangeRequired) {
      return this; // Déjà clair, retourne l'instance actuelle
    }

    return this.cloneWith({ passwordChangeRequired: false });
  }

  /**
   * Clone l'utilisateur avec des propriétés modifiées
   */
  private cloneWith(changes: { passwordChangeRequired?: boolean }): User {
    const newUser = new User(this.email, this.name, this.role, {
      passwordChangeRequired:
        changes.passwordChangeRequired ?? this.passwordChangeRequired,
    });

    // Copie des propriétés via Object.assign pour éviter les erreurs TypeScript
    Object.assign(newUser, {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      hashedPassword: this.hashedPassword,
    });

    return newUser;
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
