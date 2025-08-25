"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const login_use_case_1 = require("../../application/use-cases/auth/login.use-case");
const refresh_token_use_case_1 = require("../../application/use-cases/auth/refresh-token.use-case");
const logout_use_case_1 = require("../../application/use-cases/auth/logout.use-case");
const auth_exceptions_1 = require("../../application/exceptions/auth.exceptions");
const injection_tokens_1 = require("../../shared/constants/injection-tokens");
let AuthController = class AuthController {
    loginUseCase;
    refreshTokenUseCase;
    logoutUseCase;
    logger;
    i18n;
    constructor(loginUseCase, refreshTokenUseCase, logoutUseCase, logger, i18n) {
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.logoutUseCase = logoutUseCase;
        this.logger = logger;
        this.i18n = i18n;
    }
    async login(loginDto, req, res) {
        try {
            const result = await this.loginUseCase.execute({
                email: loginDto.email,
                password: loginDto.password,
                userAgent: req.headers['user-agent'],
                ipAddress: this.extractClientIp(req),
            });
            res.cookie('accessToken', result.tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
            });
            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return {
                success: true,
                user: result.user,
            };
        }
        catch (error) {
            this.handleAuthError(error);
        }
    }
    async refresh(req, res) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                throw new auth_exceptions_1.InvalidRefreshTokenError(this.i18n.t('auth.refresh_token_missing'));
            }
            const result = await this.refreshTokenUseCase.execute({
                refreshToken,
                userAgent: req.headers['user-agent'],
                ipAddress: this.extractClientIp(req),
            });
            res.cookie('accessToken', result.tokens.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
            });
            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            return {
                success: true,
                user: result.user,
            };
        }
        catch (error) {
            this.handleAuthError(error);
        }
    }
    async logout(logoutDto, req, res) {
        try {
            const refreshToken = req.cookies?.refreshToken;
            await this.logoutUseCase.execute({
                refreshToken: refreshToken || '',
                logoutAll: logoutDto.logoutAll || false,
                userAgent: req.headers['user-agent'],
                ipAddress: this.extractClientIp(req),
            });
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return {
                success: true,
                message: this.i18n.t('auth.logout_success'),
            };
        }
        catch (error) {
            res.clearCookie('accessToken');
            res.clearCookie('refreshToken');
            return {
                success: true,
                message: this.i18n.t('auth.logout_success'),
            };
        }
    }
    async me(req) {
        return {
            user: {
                id: 'current-user',
                email: 'user@example.com',
                name: 'Current User',
                role: 'USER',
            },
        };
    }
    extractClientIp(req) {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded
            ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
            : req.connection.remoteAddress || req.socket.remoteAddress;
        return ip || 'unknown';
    }
    handleAuthError(error) {
        this.logger.error(this.i18n.t('errors.auth.controller_error'), error, {
            operation: 'AUTH_CONTROLLER_ERROR',
            timestamp: new Date().toISOString(),
        });
        if (error instanceof auth_exceptions_1.InvalidCredentialsError) {
            throw new common_1.UnauthorizedException(this.i18n.t('auth.invalid_credentials'));
        }
        if (error instanceof auth_exceptions_1.InvalidRefreshTokenError ||
            error instanceof auth_exceptions_1.TokenExpiredError) {
            throw new common_1.UnauthorizedException(this.i18n.t('auth.invalid_refresh_token'));
        }
        if (error instanceof auth_exceptions_1.UserNotFoundError) {
            throw new common_1.UnauthorizedException(this.i18n.t('auth.user_not_found'));
        }
        if (error instanceof auth_exceptions_1.TokenRepositoryError) {
            throw new common_1.InternalServerErrorException(this.i18n.t('auth.service_unavailable'));
        }
        throw new common_1.InternalServerErrorException(this.i18n.t('auth.unexpected_error'));
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)(injection_tokens_1.TOKENS.LOGIN_USE_CASE)),
    __param(1, (0, common_1.Inject)(injection_tokens_1.TOKENS.REFRESH_TOKEN_USE_CASE)),
    __param(2, (0, common_1.Inject)(injection_tokens_1.TOKENS.LOGOUT_USE_CASE)),
    __param(3, (0, common_1.Inject)(injection_tokens_1.TOKENS.PINO_LOGGER)),
    __param(4, (0, common_1.Inject)(injection_tokens_1.TOKENS.I18N_SERVICE)),
    __metadata("design:paramtypes", [login_use_case_1.LoginUseCase,
        refresh_token_use_case_1.RefreshTokenUseCase,
        logout_use_case_1.LogoutUseCase, Object, Object])
], AuthController);
//# sourceMappingURL=auth.controller.js.map