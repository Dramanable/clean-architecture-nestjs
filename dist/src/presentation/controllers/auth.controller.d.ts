import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import type { I18nService } from '../../application/ports/i18n.port';
import type { Logger } from '../../application/ports/logger.port';
import type { UserRepository } from '../../domain/repositories/user.repository';
interface LoginDto {
    email: string;
    password: string;
    rememberMe?: boolean;
}
interface RefreshDto {
    refreshToken?: string;
}
interface LogoutDto {
    logoutAll?: boolean;
}
interface LoginResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    session: {
        sessionId: string;
        createdAt: string;
        expiresAt: string;
        deviceInfo: {
            userAgent?: string;
            ip: string;
        };
    };
}
interface RefreshTokenResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}
export declare class AuthController {
    private readonly userRepository;
    private readonly logger;
    private readonly i18n;
    private readonly configService;
    constructor(userRepository: UserRepository, logger: Logger, i18n: I18nService, configService: ConfigService);
    login(loginDto: LoginDto, request: Request, response: Response): Promise<LoginResponse>;
    refresh(refreshDto: RefreshDto, request: Request, response: Response): RefreshTokenResponse;
    logout(logoutDto: LogoutDto, request: Request, response: Response): {
        message: string;
    };
    getCurrentUser(request: Request): {
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        };
    };
    private setAuthCookies;
    private setAccessTokenCookie;
    private clearAuthCookies;
    private extractClientIP;
}
export {};
