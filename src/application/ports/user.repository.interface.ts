/**
 * 🔌 USER REPOSITORY INTERFACE
 *
 * Port pour la persistance des utilisateurs
 * Défini dans la couche Application (Clean Architecture)
 */

import { User } from '../../domain/entities/user.entity';

export interface IUserRepository {
  /**
   * Sauvegarde un utilisateur
   */
  save(user: User): Promise<User>;

  /**
   * Recherche un utilisateur par ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Recherche un utilisateur par email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Recherche un utilisateur par nom d'utilisateur
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Supprime un utilisateur
   */
  delete(id: string): Promise<void>;

  /**
   * Vérifie si un email existe déjà
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Vérifie si un nom d'utilisateur existe déjà
   */
  existsByUsername(username: string): Promise<boolean>;

  /**
   * Met à jour le mot de passe d'un utilisateur
   */
  updatePassword(id: string, passwordHash: string): Promise<void>;

  /**
   * Met à jour le statut actif d'un utilisateur
   */
  updateActiveStatus(id: string, isActive: boolean): Promise<void>;

  /**
   * Recherche des utilisateurs avec pagination
   */
  findMany(options: {
    skip?: number;
    take?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: {
      role?: string;
      isActive?: boolean;
      searchTerm?: string;
    };
  }): Promise<{
    users: User[];
    total: number;
  }>;
}
