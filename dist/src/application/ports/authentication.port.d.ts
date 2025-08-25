import { User } from '../../domain/entities/user.entity';
export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthenticationService {
    generateTokens(user: User): Promise<AuthTokens>;
    validateAccessToken(token: string): Promise<TokenPayload>;
    validateRefreshToken(token: string): Promise<TokenPayload>;
    refreshTokens(refreshToken: string): Promise<AuthTokens>;
    revokeRefreshToken(token: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
}
