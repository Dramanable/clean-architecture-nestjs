/**
 * 🔐 DEMO AUTH SYSTEM
 *
 * Démonstration du système d'authentification complet
 * Avec JWT, cookies, refresh tokens et sécurité
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

/**
 * 👤 Mock User pour la démonstration
 */
interface MockUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  isActive: boolean;
}

/**
 * 🔐 Service d'authentification pour démonstration
 */
@Injectable()
export class DemoAuthService {
  // Utilisateurs de test en mémoire
  private readonly mockUsers: MockUser[] = [
    {
      id: 'user-1',
      email: 'admin@demo.com',
      name: 'Admin User',
      password: '$2b$12$W0tfKoiA3FOeMssqtPxSweRd1MqEi57S2/ApEz4T7cb3vXxErBJfq', // secret123
      role: 'ADMIN',
      isActive: true,
    },
    {
      id: 'user-2',
      email: 'user@demo.com',
      name: 'Regular User',
      password: '$2b$12$W0tfKoiA3FOeMssqtPxSweRd1MqEi57S2/ApEz4T7cb3vXxErBJfq', // secret123
      role: 'USER',
      isActive: true,
    },
  ];

  // Sessions actives en mémoire
  private readonly activeSessions = new Map<
    string,
    {
      userId: string;
      sessionId: string;
      createdAt: Date;
      lastUsed: Date;
      ip: string;
      userAgent: string;
    }
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 🔐 Authentification
   */
  async login(email: string, password: string, ip: string, userAgent?: string) {
    console.log(`🔐 Login attempt for: ${email}`);

    // 1. Recherche de l'utilisateur
    const user = this.mockUsers.find((u) => u.email === email);
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      throw new Error('Invalid credentials');
    }

    // 2. Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${email}`);
      throw new Error('Invalid credentials');
    }

    // 3. Vérification que l'utilisateur est actif
    if (!user.isActive) {
      console.log(`❌ Account disabled: ${email}`);
      throw new Error('Account disabled');
    }

    // 4. Génération des tokens
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        sessionId,
        type: 'access',
      },
      {
        secret: 'demo-access-secret-for-development-only-32-chars',
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        sessionId,
        type: 'refresh',
      },
      {
        secret: 'demo-refresh-secret-for-development-only-32-chars',
        expiresIn: '7d',
      },
    );

    // 5. Stockage de la session
    this.activeSessions.set(sessionId, {
      userId: user.id,
      sessionId,
      createdAt: new Date(),
      lastUsed: new Date(),
      ip,
      userAgent: userAgent || 'Unknown',
    });

    console.log(`✅ Login successful for: ${email} (${user.role})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes
        refreshExpiresIn: 604800, // 7 days
      },
      session: {
        sessionId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 604800 * 1000).toISOString(),
      },
    };
  }

  /**
   * 🔄 Renouvellement de token
   */
  async refreshToken(refreshToken: string, ip: string) {
    console.log('🔄 Token refresh attempt');

    try {
      // 1. Validation du refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: 'demo-refresh-secret-for-development-only-32-chars',
      });

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // 2. Vérification de la session
      const session = this.activeSessions.get(payload.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // 3. Récupération de l'utilisateur
      const user = this.mockUsers.find((u) => u.id === payload.sub);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // 4. Génération d'un nouveau token d'accès
      const newAccessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
          sessionId: payload.sessionId,
          type: 'access',
        },
        {
          secret: 'demo-access-secret-for-development-only-32-chars',
          expiresIn: '15m',
        },
      );

      // 5. Mise à jour de la session
      session.lastUsed = new Date();

      console.log(`✅ Token refreshed successfully for user: ${user.id}`);

      return {
        accessToken: newAccessToken,
        expiresIn: 900,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      console.log(`❌ Token refresh failed: ${(error as Error).message}`);
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * ✅ Validation d'un token d'accès
   */
  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: 'demo-access-secret-for-development-only-32-chars',
      });

      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      // Vérification de la session
      const session = this.activeSessions.get(payload.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Récupération de l'utilisateur
      const user = this.mockUsers.find((u) => u.id === payload.sub);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        session: {
          sessionId: payload.sessionId,
          lastUsed: session.lastUsed,
        },
      };
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  /**
   * 🚪 Déconnexion
   */
  async logout(sessionId: string) {
    console.log(`🚪 Logout attempt for session: ${sessionId}`);

    const session = this.activeSessions.get(sessionId);
    if (session) {
      this.activeSessions.delete(sessionId);
      console.log(`✅ Session ${sessionId} terminated`);
    } else {
      console.log(`⚠️ Session ${sessionId} not found`);
    }
  }

  /**
   * 🚪 Déconnexion de toutes les sessions d'un utilisateur
   */
  async logoutAll(userId: string) {
    console.log(`🚪 Logout all sessions for user: ${userId}`);

    let sessionCount = 0;
    for (const [sessionId, session] of this.activeSessions) {
      if (session.userId === userId) {
        this.activeSessions.delete(sessionId);
        sessionCount++;
      }
    }

    console.log(`✅ Terminated ${sessionCount} sessions for user: ${userId}`);
  }

  /**
   * 📊 Statistiques des sessions
   */
  getSessionStats() {
    const activeSessionCount = this.activeSessions.size;
    const userSessions = new Map<string, number>();

    for (const session of this.activeSessions.values()) {
      const count = userSessions.get(session.userId) || 0;
      userSessions.set(session.userId, count + 1);
    }

    return {
      totalActiveSessions: activeSessionCount,
      userSessionCounts: Object.fromEntries(userSessions),
      lastActivity: Array.from(this.activeSessions.values())
        .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
        .slice(0, 5) // 5 dernières activités
        .map((session) => ({
          userId: session.userId,
          sessionId: session.sessionId,
          lastUsed: session.lastUsed,
          ip: session.ip,
          userAgent: session.userAgent,
        })),
    };
  }

  /**
   * 🧪 Méthodes pour les tests
   */
  async createTestUser(
    email: string,
    password: string,
    role = 'USER',
  ): Promise<MockUser> {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user: MockUser = {
      id: `user-${Date.now()}`,
      email,
      name: `Test User ${email}`,
      password: hashedPassword,
      role,
      isActive: true,
    };
    this.mockUsers.push(user);
    return user;
  }

  getActiveSessions() {
    return Array.from(this.activeSessions.values());
  }

  clearAllSessions() {
    this.activeSessions.clear();
    console.log('🧹 All sessions cleared');
  }
}

/**
 * 🧪 Exemple d'utilisation et tests
 */
export async function demonstrateAuthSystem() {
  console.log("\n🎯 === DEMONSTRATION DU SYSTÈME D'AUTHENTIFICATION ===\n");

  const authService = new DemoAuthService(
    new JwtService(),
    new ConfigService(),
  );

  try {
    // 1. Test de connexion réussie
    console.log('1️⃣ Test de connexion avec credentials valides:');
    const loginResult = await authService.login(
      'admin@demo.com',
      'secret123',
      '192.168.1.1',
      'Mozilla/5.0 (Test Browser)',
    );
    console.log(
      `   Utilisateur connecté: ${loginResult.user.name} (${loginResult.user.role})`,
    );
    console.log(`   Session ID: ${loginResult.session.sessionId}`);
    console.log(
      `   Access Token: ${loginResult.tokens.accessToken.substring(0, 50)}...`,
    );

    // 2. Test de validation de token
    console.log('\n2️⃣ Test de validation de token:');
    const validation = await authService.validateAccessToken(
      loginResult.tokens.accessToken,
    );
    console.log(`   Token valide pour: ${validation.user.name}`);

    // 3. Test de refresh token
    console.log('\n3️⃣ Test de renouvellement de token:');
    const refreshResult = await authService.refreshToken(
      loginResult.tokens.refreshToken,
      '192.168.1.1',
    );
    console.log(`   Nouveau token généré pour: ${refreshResult.user.name}`);

    // 4. Test de statistiques
    console.log('\n4️⃣ Statistiques des sessions:');
    const stats = authService.getSessionStats();
    console.log(`   Sessions actives: ${stats.totalActiveSessions}`);
    console.log(`   Dernière activité:`, stats.lastActivity[0]);

    // 5. Test de déconnexion
    console.log('\n5️⃣ Test de déconnexion:');
    await authService.logout(loginResult.session.sessionId);
    const statsAfterLogout = authService.getSessionStats();
    console.log(
      `   Sessions actives après déconnexion: ${statsAfterLogout.totalActiveSessions}`,
    );

    console.log(
      "\n✅ Tous les tests d'authentification sont passés avec succès!",
    );
  } catch (error) {
    console.error(
      '\n❌ Erreur durant la démonstration:',
      (error as Error).message,
    );
  }
}

// Exécution automatique de la démonstration si ce fichier est exécuté directement
if (require.main === module) {
  demonstrateAuthSystem();
}
