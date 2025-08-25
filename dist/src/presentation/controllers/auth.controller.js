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
const config_1 = require("@nestjs/config");
const email_vo_1 = require("../../domain/value-objects/email.vo");
const injection_tokens_1 = require("../../shared/constants/injection-tokens");
let AuthController = class AuthController {
    userRepository;
    logger;
    i18n;
    configService;
    constructor(userRepository, logger, i18n, configService) {
        this.userRepository = userRepository;
        this.logger = logger;
        this.i18n = i18n;
        this.configService = configService;
    }
    async login(loginDto, request, response) {
        this.logger.info(this.i18n.t('auth.login_attempt', { email: loginDto.email }), {
            operation: 'AUTH_LOGIN',
            email: loginDto.email,
            rememberMe: loginDto.rememberMe,
            userAgent: request.headers['user-agent'],
            ip: this.extractClientIP(request),
        });
        try {
            const email = new email_vo_1.Email(loginDto.email);
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                this.logger.warn(this.i18n.t('auth.user_not_found', { email: loginDto.email }), { operation: 'AUTH_LOGIN', email: loginDto.email });
                throw new common_1.UnauthorizedException(this.i18n.t('auth.invalid_credentials'));
            }
            const mockTokens = {
                accessToken: 'mock_access_token',
                refreshToken: 'mock_refresh_token',
            };
            this.setAuthCookies(response, mockTokens, loginDto.rememberMe);
            const loginResponse = {
                user: {
                    id: user.id,
                    email: user.email.value,
                    name: user.name,
                    role: user.role,
                },
                session: {
                    sessionId: `sess_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 900 * 1000).toISOString(),
                    deviceInfo: {
                        userAgent: request.headers['user-agent'],
                        ip: this.extractClientIP(request),
                    },
                },
            };
            this.logger.info(this.i18n.t('auth.login_successful', { userId: user.id }), {
                operation: 'AUTH_LOGIN',
                userId: user.id,
                sessionId: loginResponse.session.sessionId,
            });
            return loginResponse;
        }
        catch (error) {
            this.logger.error(this.i18n.t('auth.login_error', {
                email: loginDto.email,
                error: error instanceof Error ? error.message : 'Unknown error',
            }), error, {
                operation: 'AUTH_LOGIN',
                email: loginDto.email,
            });
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException(this.i18n.t('auth.login_failed'));
        }
    }
    refresh(refreshDto, request, response) {
        this.logger.info(this.i18n.t('auth.refresh_attempt'), {
            operation: 'AUTH_REFRESH',
            userAgent: request.headers['user-agent'],
            ip: this.extractClientIP(request),
        });
        try {
            const mockAccessToken = 'mock_new_access_token';
            this.setAccessTokenCookie(response, mockAccessToken, 900);
            const mockResponse = {
                user: {
                    id: 'mock_user_id',
                    email: 'mock@example.com',
                    name: 'Mock User',
                    role: 'USER',
                },
            };
            this.logger.info(this.i18n.t('auth.refresh_successful'), {
                operation: 'AUTH_REFRESH',
                userId: mockResponse.user.id,
            });
            return mockResponse;
        }
        catch (error) {
            this.logger.error(this.i18n.t('auth.refresh_error', {
                error: error instanceof Error ? error.message : 'Unknown error',
            }), error, {
                operation: 'AUTH_REFRESH',
            });
            throw new common_1.UnauthorizedException(this.i18n.t('auth.refresh_failed'));
        }
    }
    logout(logoutDto, request, response) {
        this.logger.info(this.i18n.t('auth.logout_attempt'), {
            operation: 'AUTH_LOGOUT',
            logoutAll: logoutDto.logoutAll,
            userAgent: request.headers['user-agent'],
            ip: this.extractClientIP(request),
        });
        try {
            this.clearAuthCookies(response);
            this.logger.info(this.i18n.t('auth.logout_successful'), {
                operation: 'AUTH_LOGOUT',
                logoutAll: logoutDto.logoutAll,
            });
            return {
                message: this.i18n.t('auth.logout_message'),
            };
        }
        catch (error) {
            this.logger.error(this.i18n.t('auth.logout_error', {
                error: error instanceof Error ? error.message : 'Unknown error',
            }), error, {
                operation: 'AUTH_LOGOUT',
            });
            throw new common_1.BadRequestException(this.i18n.t('auth.logout_failed'));
        }
    }
    getCurrentUser(request) {
        this.logger.info(this.i18n.t('auth.fetch_user_info'), {
            operation: 'AUTH_ME',
            userAgent: request.headers['user-agent'],
            ip: this.extractClientIP(request),
        });
        try {
            const mockUser = {
                user: {
                    id: 'mock_user_id',
                    email: 'mock@example.com',
                    name: 'Mock User',
                    role: 'USER',
                },
            };
            this.logger.info(this.i18n.t('auth.user_info_fetched'), {
                operation: 'AUTH_ME',
                userId: mockUser.user.id,
            });
            return mockUser;
        }
        catch (error) {
            this.logger.error(this.i18n.t('auth.fetch_user_error', {
                error: error instanceof Error ? error.message : 'Unknown error',
            }), error, {
                operation: 'AUTH_ME',
            });
            throw new common_1.UnauthorizedException(this.i18n.t('auth.authentication_required'));
        }
    }
    setAuthCookies(response, tokens, rememberMe) {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            domain: isProduction
                ? this.configService.get('COOKIE_DOMAIN')
                : undefined,
            path: '/',
        };
        response.cookie('auth_access_token', tokens.accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });
        const refreshMaxAge = rememberMe
            ? 7 * 24 * 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;
        response.cookie('auth_refresh_token', tokens.refreshToken, {
            ...cookieOptions,
            maxAge: refreshMaxAge,
        });
        this.logger.debug(this.i18n.t('auth.cookies_configured'), {
            operation: 'SET_AUTH_COOKIES',
            rememberMe,
            isProduction,
        });
    }
    setAccessTokenCookie(response, accessToken, expiresIn) {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        response.cookie('auth_access_token', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            domain: isProduction
                ? this.configService.get('COOKIE_DOMAIN')
                : undefined,
            path: '/',
            maxAge: expiresIn * 1000,
        });
        this.logger.debug(this.i18n.t('auth.access_token_updated'), {
            operation: 'UPDATE_ACCESS_TOKEN_COOKIE',
            expiresIn,
            isProduction,
        });
    }
    clearAuthCookies(response) {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            domain: isProduction
                ? this.configService.get('COOKIE_DOMAIN')
                : undefined,
            path: '/',
        };
        response.clearCookie('auth_access_token', cookieOptions);
        response.clearCookie('auth_refresh_token', cookieOptions);
        this.logger.debug(this.i18n.t('auth.cookies_cleared'), {
            operation: 'CLEAR_AUTH_COOKIES',
            isProduction,
        });
    }
    extractClientIP(request) {
        return (request.headers['cf-connecting-ip'] ||
            request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            request.headers['x-real-ip'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            'unknown');
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
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], AuthController.prototype, "getCurrentUser", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)(injection_tokens_1.TOKENS.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(injection_tokens_1.TOKENS.LOGGER)),
    __param(2, (0, common_1.Inject)(injection_tokens_1.TOKENS.I18N_SERVICE)),
    __param(3, (0, common_1.Inject)(injection_tokens_1.TOKENS.CONFIG_SERVICE)),
    __metadata("design:paramtypes", [Object, Object, Object, config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map