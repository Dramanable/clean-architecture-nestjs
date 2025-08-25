import { User } from '../../domain/entities/user.entity';
import { JWTPayload, JWTTokens, SecurityContext } from '../../shared/types/auth.types';
export interface IAuthTokenService {
    generateAuthTokens(user: User, securityContext: SecurityContext, rememberMe?: boolean): Promise<JWTTokens & {
        sessionId: string;
    }>;
    generateAccessToken(user: User, sessionId: string): Promise<{
        token: string;
        expiresIn: number;
    }>;
    validateAccessToken(token: string): Promise<JWTPayload>;
    validateRefreshToken(token: string, securityContext: SecurityContext): Promise<JWTPayload>;
    revokeSession(sessionId: string): Promise<void>;
    revokeAllUserSessions(userId: string): Promise<void>;
    isRefreshTokenRevoked(tokenId: string): Promise<boolean>;
    cleanupExpiredTokens(): Promise<void>;
    getActiveSessions(userId: string): Promise<Array<{
        sessionId: string;
        deviceInfo: string;
        ip: string;
        createdAt: Date;
        lastUsed: Date;
    }>>;
}
