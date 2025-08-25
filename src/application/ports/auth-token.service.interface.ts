/**
 * 🔌 AUTH TOKEN SERVICE INTERFACE
 *
 * Port pour la gestion des tokens JWT
 * Défini dans la couche Application (Clean Architecture)
 */

import { User } from '../../domain/entities/user.entity';
import {
    JWTPayload,
    JWTTokens,
    SecurityContext,
} from '../../shared/types/auth.types';

export interface IAuthTokenService {
  /**
   * Génère les tokens d'authentification (access + refresh)
   */
  generateAuthTokens(
    user: User,
    securityContext: SecurityContext,
    rememberMe?: boolean,
  ): Promise<JWTTokens & { sessionId: string }>;

  /**
   * Génère uniquement un token d'accès
   */
  generateAccessToken(
    user: User,
    sessionId: string,
  ): Promise<{ token: string; expiresIn: number }>;

  /**
   * Valide un token d'accès
   */
  validateAccessToken(token: string): Promise<JWTPayload>;

  /**
   * Valide un refresh token
   */
  validateRefreshToken(
    token: string,
    securityContext: SecurityContext,
  ): Promise<JWTPayload>;

  /**
   * Révoque une session spécifique
   */
  revokeSession(sessionId: string): Promise<void>;

  /**
   * Révoque toutes les sessions d'un utilisateur
   */
  revokeAllUserSessions(userId: string): Promise<void>;

  /**
   * Vérifie si un refresh token est révoqué
   */
  isRefreshTokenRevoked(tokenId: string): Promise<boolean>;

  /**
   * Nettoie les tokens expirés
   */
  cleanupExpiredTokens(): Promise<void>;

  /**
   * Récupère les sessions actives d'un utilisateur
   */
  getActiveSessions(userId: string): Promise<
    Array<{
      sessionId: string;
      deviceInfo: string;
      ip: string;
      createdAt: Date;
      lastUsed: Date;
    }>
  >;
}
