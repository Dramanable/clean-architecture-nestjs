"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOKENS = exports.PRESENTATION_TOKENS = exports.INFRASTRUCTURE_TOKENS = exports.DOMAIN_TOKENS = exports.APPLICATION_TOKENS = void 0;
exports.isValidToken = isValidToken;
exports.getTokensByLayer = getTokensByLayer;
exports.APPLICATION_TOKENS = {
    LOGGER: 'Logger',
    I18N_SERVICE: 'I18nService',
    CONFIG_SERVICE: 'IConfigService',
    EMAIL_SERVICE: 'EmailService',
    PASSWORD_SERVICE: 'PasswordService',
    PASSWORD_GENERATOR: 'PasswordGenerator',
    TOKEN_SERVICE: 'TokenService',
    CREATE_USER_USE_CASE: 'CreateUserUseCase',
    GET_USER_USE_CASE: 'GetUserUseCase',
    UPDATE_USER_USE_CASE: 'UpdateUserUseCase',
    DELETE_USER_USE_CASE: 'DeleteUserUseCase',
    LOGIN_USE_CASE: 'LoginUseCase',
    REFRESH_TOKEN_USE_CASE: 'RefreshTokenUseCase',
    LOGOUT_USE_CASE: 'LogoutUseCase',
    USER_ONBOARDING_SERVICE: 'UserOnboardingApplicationService',
    AUTH_TOKEN_SERVICE: 'AuthTokenService',
    AUTH_SERVICE: 'AuthService',
    JWT_SERVICE: 'JwtService',
};
exports.DOMAIN_TOKENS = {
    USER_REPOSITORY: 'UserRepository',
    REFRESH_TOKEN_REPOSITORY: 'RefreshTokenRepository',
    USER_DOMAIN_SERVICE: 'UserDomainService',
    PASSWORD_DOMAIN_SERVICE: 'PasswordDomainService',
    EMAIL_DOMAIN_SERVICE: 'EmailDomainService',
};
exports.INFRASTRUCTURE_TOKENS = {
    DATABASE_TYPE: 'DatabaseType',
    DATABASE_CONNECTION: 'DatabaseConnection',
    TYPEORM_CONNECTION: 'TypeOrmConnection',
    MONGO_CONNECTION: 'MongoConnection',
    TYPEORM_USER_REPOSITORY: 'TypeOrmUserRepository',
    MONGO_USER_REPOSITORY: 'MongoUserRepository',
    PINO_LOGGER: 'PinoLogger',
    CONSOLE_LOGGER: 'ConsoleLogger',
    SMTP_EMAIL_SERVICE: 'SmtpEmailService',
    BCRYPT_PASSWORD_SERVICE: 'BcryptPasswordService',
    JWT_TOKEN_SERVICE: 'JwtTokenService',
    USER_MAPPER: 'UserMapper',
    DATABASE_MAPPER_FACTORY: 'DatabaseMapperFactory',
    APP_CONFIG: 'AppConfig',
    DATABASE_CONFIG: 'DatabaseConfig',
    LOGGER_CONFIG: 'LoggerConfig',
};
exports.PRESENTATION_TOKENS = {
    USER_CONTROLLER: 'UserController',
    AUTH_CONTROLLER: 'AuthController',
    HTTP_SERVICE: 'HttpService',
    VALIDATION_PIPE: 'ValidationPipe',
};
exports.TOKENS = {
    ...exports.APPLICATION_TOKENS,
    ...exports.DOMAIN_TOKENS,
    ...exports.INFRASTRUCTURE_TOKENS,
    ...exports.PRESENTATION_TOKENS,
};
function isValidToken(token) {
    return Object.values(exports.TOKENS).includes(token);
}
function getTokensByLayer(layer) {
    switch (layer) {
        case 'application':
            return exports.APPLICATION_TOKENS;
        case 'domain':
            return exports.DOMAIN_TOKENS;
        case 'infrastructure':
            return exports.INFRASTRUCTURE_TOKENS;
        case 'presentation':
            return exports.PRESENTATION_TOKENS;
        default:
            throw new Error(`Unknown layer: ${layer}`);
    }
}
//# sourceMappingURL=injection-tokens.js.map