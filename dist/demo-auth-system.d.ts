import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
interface MockUser {
    id: string;
    email: string;
    name: string;
    password: string;
    role: string;
    isActive: boolean;
}
export declare class DemoAuthService {
    private readonly jwtService;
    private readonly configService;
    private readonly mockUsers;
    private readonly activeSessions;
    constructor(jwtService: JwtService, configService: ConfigService);
    login(email: string, password: string, ip: string, userAgent?: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
            expiresIn: number;
            refreshExpiresIn: number;
        };
        session: {
            sessionId: string;
            createdAt: string;
            expiresAt: string;
        };
    }>;
    refreshToken(refreshToken: string, ip: string): Promise<{
        accessToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    }>;
    validateAccessToken(token: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
        session: {
            sessionId: any;
            lastUsed: Date;
        };
    }>;
    logout(sessionId: string): Promise<void>;
    logoutAll(userId: string): Promise<void>;
    getSessionStats(): {
        totalActiveSessions: number;
        userSessionCounts: {
            [k: string]: number;
        };
        lastActivity: {
            userId: string;
            sessionId: string;
            lastUsed: Date;
            ip: string;
            userAgent: string;
        }[];
    };
    createTestUser(email: string, password: string, role?: string): Promise<MockUser>;
    getActiveSessions(): {
        userId: string;
        sessionId: string;
        createdAt: Date;
        lastUsed: Date;
        ip: string;
        userAgent: string;
    }[];
    clearAllSessions(): void;
}
export declare function demonstrateAuthSystem(): Promise<void>;
export {};
