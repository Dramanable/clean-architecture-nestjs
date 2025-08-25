"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const refresh_token_entity_1 = require("../../../domain/entities/refresh-token.entity");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
const user_exceptions_1 = require("../../../domain/exceptions/user.exceptions");
class LoginUseCase {
    userRepository;
    refreshTokenRepository;
    passwordService;
    tokenService;
    logger;
    i18n;
    config;
    constructor(userRepository, refreshTokenRepository, passwordService, tokenService, logger, i18n, config) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
        this.logger = logger;
        this.i18n = i18n;
        this.config = config;
    }
    async execute(request) {
        const startTime = Date.now();
        const requestContext = {
            operation: 'Login',
            email: request.email,
            deviceId: request.deviceId,
            ipAddress: request.ipAddress,
        };
        this.logger.info(this.i18n.t('operations.auth.login_attempt', {
            email: request.email,
        }), requestContext);
        try {
            this.logger.debug(this.i18n.t('operations.user.validation_process'), requestContext);
            const email = new email_vo_1.Email(request.email.trim());
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                this.logger.warn(this.i18n.t('warnings.auth.invalid_credentials'), { ...requestContext, reason: 'user_not_found' });
                throw new user_exceptions_1.InvalidCredentialsError();
            }
            this.logger.debug(this.i18n.t('operations.auth.password_verification'), requestContext);
            const isValidPassword = await this.passwordService.verify(request.password, user.hashedPassword || 'dummy-hash');
            if (!isValidPassword) {
                this.logger.warn(this.i18n.t('warnings.auth.invalid_credentials'), { ...requestContext, reason: 'invalid_password' });
                throw new user_exceptions_1.InvalidCredentialsError();
            }
            await this.revokeExistingTokens(user.id, requestContext);
            this.logger.debug(this.i18n.t('operations.auth.token_generation'), requestContext);
            const accessToken = this.tokenService.generateAccessToken(user.id, user.email.value, user.role, this.config.getAccessTokenSecret(), this.config.getAccessTokenExpirationTime(), this.config.getAccessTokenAlgorithm());
            const refreshTokenValue = this.tokenService.generateRefreshToken(this.config.getRefreshTokenSecret(), this.config.getRefreshTokenAlgorithm());
            const expiresAt = new Date();
            const refreshTokenExpirationDays = this.config.getRefreshTokenExpirationDays();
            expiresAt.setDate(expiresAt.getDate() + refreshTokenExpirationDays);
            const refreshToken = new refresh_token_entity_1.RefreshToken(user.id, refreshTokenValue, expiresAt, request.deviceId, request.userAgent, request.ipAddress);
            await this.refreshTokenRepository.save(refreshToken);
            const duration = Date.now() - startTime;
            this.logger.info(this.i18n.t('success.auth.login_success', {
                email: user.email.value,
                userId: user.id,
            }), { ...requestContext, duration });
            this.logger.audit(this.i18n.t('audit.auth.user_logged_in'), user.id, {
                email: user.email.value,
                deviceId: request.deviceId,
                ipAddress: request.ipAddress,
                userAgent: request.userAgent,
            });
            return {
                accessToken,
                refreshToken: refreshTokenValue,
                user: {
                    id: user.id,
                    email: user.email.value,
                    name: user.name,
                    role: user.role,
                },
                expiresIn: this.config.getAccessTokenExpirationTime(),
                tokenType: 'Bearer',
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            if (!(error instanceof user_exceptions_1.InvalidCredentialsError)) {
                this.logger.error(this.i18n.t('operations.failed', { operation: 'Login' }), error, { ...requestContext, duration });
            }
            throw error;
        }
    }
    async revokeExistingTokens(userId, requestContext) {
        try {
            this.logger.debug(this.i18n.t('operations.auth.token_revocation'), requestContext);
            await this.refreshTokenRepository.revokeAllByUserId(userId);
        }
        catch (error) {
            this.logger.warn(this.i18n.t('warnings.auth.token_revocation_failed'), { ...requestContext, error: error.message });
        }
    }
}
exports.LoginUseCase = LoginUseCase;
//# sourceMappingURL=login.use-case.js.map