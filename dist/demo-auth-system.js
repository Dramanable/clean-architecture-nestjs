"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoAuthService = void 0;
exports.demonstrateAuthSystem = demonstrateAuthSystem;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
let DemoAuthService = class DemoAuthService {
    jwtService;
    configService;
    mockUsers = [
        {
            id: 'user-1',
            email: 'admin@demo.com',
            name: 'Admin User',
            password: '$2b$12$W0tfKoiA3FOeMssqtPxSweRd1MqEi57S2/ApEz4T7cb3vXxErBJfq',
            role: 'ADMIN',
            isActive: true,
        },
        {
            id: 'user-2',
            email: 'user@demo.com',
            name: 'Regular User',
            password: '$2b$12$W0tfKoiA3FOeMssqtPxSweRd1MqEi57S2/ApEz4T7cb3vXxErBJfq',
            role: 'USER',
            isActive: true,
        },
    ];
    activeSessions = new Map();
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async login(email, password, ip, userAgent) {
        console.log(`🔐 Login attempt for: ${email}`);
        const user = this.mockUsers.find((u) => u.email === email);
        if (!user) {
            console.log(`❌ User not found: ${email}`);
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`❌ Invalid password for: ${email}`);
            throw new Error('Invalid credentials');
        }
        if (!user.isActive) {
            console.log(`❌ Account disabled: ${email}`);
            throw new Error('Account disabled');
        }
        const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const accessToken = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
            sessionId,
            type: 'access',
        }, {
            secret: 'demo-access-secret-for-development-only-32-chars',
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign({
            sub: user.id,
            sessionId,
            type: 'refresh',
        }, {
            secret: 'demo-refresh-secret-for-development-only-32-chars',
            expiresIn: '7d',
        });
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
                expiresIn: 900,
                refreshExpiresIn: 604800,
            },
            session: {
                sessionId,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 604800 * 1000).toISOString(),
            },
        };
    }
    async refreshToken(refreshToken, ip) {
        console.log('🔄 Token refresh attempt');
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: 'demo-refresh-secret-for-development-only-32-chars',
            });
            if (payload.type !== 'refresh') {
                throw new Error('Invalid token type');
            }
            const session = this.activeSessions.get(payload.sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            const user = this.mockUsers.find((u) => u.id === payload.sub);
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }
            const newAccessToken = this.jwtService.sign({
                sub: user.id,
                email: user.email,
                role: user.role,
                sessionId: payload.sessionId,
                type: 'access',
            }, {
                secret: 'demo-access-secret-for-development-only-32-chars',
                expiresIn: '15m',
            });
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
        }
        catch (error) {
            console.log(`❌ Token refresh failed: ${error.message}`);
            throw new Error('Invalid refresh token');
        }
    }
    async validateAccessToken(token) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: 'demo-access-secret-for-development-only-32-chars',
            });
            if (payload.type !== 'access') {
                throw new Error('Invalid token type');
            }
            const session = this.activeSessions.get(payload.sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
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
        }
        catch (error) {
            throw new Error('Invalid access token');
        }
    }
    async logout(sessionId) {
        console.log(`🚪 Logout attempt for session: ${sessionId}`);
        const session = this.activeSessions.get(sessionId);
        if (session) {
            this.activeSessions.delete(sessionId);
            console.log(`✅ Session ${sessionId} terminated`);
        }
        else {
            console.log(`⚠️ Session ${sessionId} not found`);
        }
    }
    async logoutAll(userId) {
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
    getSessionStats() {
        const activeSessionCount = this.activeSessions.size;
        const userSessions = new Map();
        for (const session of this.activeSessions.values()) {
            const count = userSessions.get(session.userId) || 0;
            userSessions.set(session.userId, count + 1);
        }
        return {
            totalActiveSessions: activeSessionCount,
            userSessionCounts: Object.fromEntries(userSessions),
            lastActivity: Array.from(this.activeSessions.values())
                .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
                .slice(0, 5)
                .map((session) => ({
                userId: session.userId,
                sessionId: session.sessionId,
                lastUsed: session.lastUsed,
                ip: session.ip,
                userAgent: session.userAgent,
            })),
        };
    }
    async createTestUser(email, password, role = 'USER') {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = {
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
};
exports.DemoAuthService = DemoAuthService;
exports.DemoAuthService = DemoAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], DemoAuthService);
async function demonstrateAuthSystem() {
    console.log("\n🎯 === DEMONSTRATION DU SYSTÈME D'AUTHENTIFICATION ===\n");
    const authService = new DemoAuthService(new jwt_1.JwtService(), new config_1.ConfigService());
    try {
        console.log('1️⃣ Test de connexion avec credentials valides:');
        const loginResult = await authService.login('admin@demo.com', 'secret123', '192.168.1.1', 'Mozilla/5.0 (Test Browser)');
        console.log(`   Utilisateur connecté: ${loginResult.user.name} (${loginResult.user.role})`);
        console.log(`   Session ID: ${loginResult.session.sessionId}`);
        console.log(`   Access Token: ${loginResult.tokens.accessToken.substring(0, 50)}...`);
        console.log('\n2️⃣ Test de validation de token:');
        const validation = await authService.validateAccessToken(loginResult.tokens.accessToken);
        console.log(`   Token valide pour: ${validation.user.name}`);
        console.log('\n3️⃣ Test de renouvellement de token:');
        const refreshResult = await authService.refreshToken(loginResult.tokens.refreshToken, '192.168.1.1');
        console.log(`   Nouveau token généré pour: ${refreshResult.user.name}`);
        console.log('\n4️⃣ Statistiques des sessions:');
        const stats = authService.getSessionStats();
        console.log(`   Sessions actives: ${stats.totalActiveSessions}`);
        console.log(`   Dernière activité:`, stats.lastActivity[0]);
        console.log('\n5️⃣ Test de déconnexion:');
        await authService.logout(loginResult.session.sessionId);
        const statsAfterLogout = authService.getSessionStats();
        console.log(`   Sessions actives après déconnexion: ${statsAfterLogout.totalActiveSessions}`);
        console.log("\n✅ Tous les tests d'authentification sont passés avec succès!");
    }
    catch (error) {
        console.error('\n❌ Erreur durant la démonstration:', error.message);
    }
}
if (require.main === module) {
    demonstrateAuthSystem();
}
//# sourceMappingURL=demo-auth-system.js.map