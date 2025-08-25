export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface LoginResponse {
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
        deviceInfo?: any;
    };
}
export interface GetCurrentUserResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}
export interface JWTTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshExpiresIn: number;
}
export interface RefreshTokenRequest {
    refreshToken?: string;
    deviceId?: string;
}
export interface RefreshTokenResponse {
    accessToken: string;
    expiresIn: number;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}
export interface LogoutRequest {
    refreshToken?: string;
    logoutAll?: boolean;
}
export interface CookieConfig {
    accessTokenCookie: {
        name: string;
        maxAge: number;
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'strict' | 'lax' | 'none';
        domain?: string;
        path: string;
    };
    refreshTokenCookie: {
        name: string;
        maxAge: number;
        httpOnly: boolean;
        secure: boolean;
        sameSite: 'strict' | 'lax' | 'none';
        domain?: string;
        path: string;
    };
}
export interface JWTPayload {
    sub: string;
    email: string;
    role: string;
    sessionId: string;
    iat: number;
    exp: number;
    iss: string;
    aud: string;
}
export interface DeviceSession {
    id: string;
    userId: string;
    deviceId?: string;
    userAgent?: string;
    ip?: string;
    accessTokenHash: string;
    refreshTokenHash: string;
    createdAt: Date;
    lastUsedAt: Date;
    expiresAt: Date;
    isRevoked: boolean;
    revokedAt?: Date;
    revokedReason?: string;
}
export interface SecurityContext {
    requestId: string;
    userAgent?: string;
    ip?: string;
    timestamp: Date;
    environment: 'development' | 'staging' | 'production';
    securityHeaders?: Record<string, string>;
}
