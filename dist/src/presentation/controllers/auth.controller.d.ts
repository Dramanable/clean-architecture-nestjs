import type { Request, Response } from 'express';
import type { I18nService } from '../../application/ports/i18n.port';
import type { Logger } from '../../application/ports/logger.port';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
interface LoginDto {
    email: string;
    password: string;
    rememberMe?: boolean;
}
interface LogoutDto {
    logoutAll?: boolean;
}
export declare class AuthController {
    private readonly loginUseCase;
    private readonly refreshTokenUseCase;
    private readonly logoutUseCase;
    private readonly logger;
    private readonly i18n;
    constructor(loginUseCase: LoginUseCase, refreshTokenUseCase: RefreshTokenUseCase, logoutUseCase: LogoutUseCase, logger: Logger, i18n: I18nService);
    login(loginDto: LoginDto, req: Request, res: Response): Promise<{
        success: boolean;
        user: any;
    }>;
    refresh(req: Request, res: Response): Promise<{
        success: boolean;
        user: any;
    }>;
    logout(logoutDto: LogoutDto, req: Request, res: Response): Promise<{
        success: boolean;
        message: string;
    }>;
    me(req: Request): Promise<{
        user: any;
    }>;
    private extractClientIp;
    private handleAuthError;
}
export {};
