import { UserRepository } from '../../../domain/repositories/user.repository';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { Logger } from '../../ports/logger.port';
import type { I18nService } from '../../ports/i18n.port';
import { IConfigService } from '../../ports/config.port';
export interface PasswordService {
    verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
export interface TokenService {
    generateAccessToken(userId: string, email: string, role: string, secret: string, expiresIn: number, algorithm?: string): string;
    generateRefreshToken(secret: string, algorithm?: string): string;
}
export interface RefreshTokenRepository {
    save(refreshToken: RefreshToken): Promise<RefreshToken>;
    findByUserId(userId: string): Promise<RefreshToken[]>;
    revokeAllByUserId(userId: string): Promise<void>;
}
export interface LoginRequest {
    email: string;
    password: string;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
}
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    expiresIn: number;
    tokenType: 'Bearer';
}
export declare class LoginUseCase {
    private readonly userRepository;
    private readonly refreshTokenRepository;
    private readonly passwordService;
    private readonly tokenService;
    private readonly logger;
    private readonly i18n;
    private readonly config;
    constructor(userRepository: UserRepository, refreshTokenRepository: RefreshTokenRepository, passwordService: PasswordService, tokenService: TokenService, logger: Logger, i18n: I18nService, config: IConfigService);
    execute(request: LoginRequest): Promise<LoginResponse>;
    private revokeExistingTokens;
}
