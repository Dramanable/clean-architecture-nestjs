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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AppConfigService = class AppConfigService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    getAccessTokenExpirationTime() {
        return this.configService.get('ACCESS_TOKEN_EXPIRATION', 3600);
    }
    getRefreshTokenExpirationDays() {
        return this.configService.get('REFRESH_TOKEN_EXPIRATION_DAYS', 30);
    }
    getAccessTokenSecret() {
        const secret = this.configService.get('ACCESS_TOKEN_SECRET');
        if (!secret) {
            throw new Error('ACCESS_TOKEN_SECRET is required. Please set this environment variable.');
        }
        if (secret.length < 32) {
            throw new Error('ACCESS_TOKEN_SECRET must be at least 32 characters long for security.');
        }
        return secret;
    }
    getRefreshTokenSecret() {
        const secret = this.configService.get('REFRESH_TOKEN_SECRET');
        if (!secret) {
            throw new Error('REFRESH_TOKEN_SECRET is required. Please set this environment variable.');
        }
        if (secret.length < 32) {
            throw new Error('REFRESH_TOKEN_SECRET must be at least 32 characters long for security.');
        }
        if (secret === this.getAccessTokenSecret()) {
            throw new Error('REFRESH_TOKEN_SECRET must be different from ACCESS_TOKEN_SECRET for security reasons.');
        }
        return secret;
    }
    getJwtIssuer() {
        return this.configService.get('JWT_ISSUER', 'clean-arch-app');
    }
    getJwtAudience() {
        return this.configService.get('JWT_AUDIENCE', 'clean-arch-users');
    }
    getAccessTokenAlgorithm() {
        return this.configService.get('ACCESS_TOKEN_ALGORITHM', 'HS256');
    }
    getRefreshTokenAlgorithm() {
        return this.configService.get('REFRESH_TOKEN_ALGORITHM', 'HS256');
    }
    getPasswordHashAlgorithm() {
        return this.configService.get('PASSWORD_HASH_ALGORITHM', 'bcrypt');
    }
    getBcryptRounds() {
        const rounds = this.configService.get('BCRYPT_ROUNDS', 12);
        if (rounds < 10 || rounds > 20) {
            throw new Error('BCRYPT_ROUNDS must be between 10 and 20 for security and performance balance.');
        }
        return rounds;
    }
    getEnvironment() {
        return this.configService.get('NODE_ENV', 'development');
    }
    getDatabaseType() {
        const dbType = this.configService.get('DATABASE_TYPE', 'postgresql');
        if (!['postgresql', 'mongodb', 'mysql', 'sqlite'].includes(dbType)) {
            throw new Error(`Unsupported DATABASE_TYPE: ${dbType}. Supported: postgresql, mongodb, mysql, sqlite`);
        }
        return dbType;
    }
    getDatabaseHost() {
        return this.configService.get('DATABASE_HOST', 'localhost');
    }
    getDatabasePort() {
        return this.configService.get('DATABASE_PORT', 5432);
    }
    getDatabaseUsername() {
        return this.configService.get('DATABASE_USERNAME', 'admin');
    }
    getDatabasePassword() {
        const password = this.configService.get('DATABASE_PASSWORD');
        if (!password) {
            throw new Error('DATABASE_PASSWORD is required. Please set this environment variable.');
        }
        return password;
    }
    getDatabaseName() {
        return this.configService.get('DATABASE_NAME', 'cleanarchi');
    }
    getDatabasePoolSize() {
        return this.configService.get('DATABASE_POOL_SIZE', 10);
    }
    getRedisHost() {
        return this.configService.get('REDIS_HOST', 'localhost');
    }
    getRedisPort() {
        return this.configService.get('REDIS_PORT', 6379);
    }
    getRedisPassword() {
        return this.configService.get('REDIS_PASSWORD', '');
    }
    getPort() {
        return this.configService.get('PORT', 3000);
    }
    getHost() {
        return this.configService.get('HOST', '0.0.0.0');
    }
    getMongoConnectionString() {
        const host = this.configService.get('MONGO_HOST', 'localhost');
        const port = this.configService.get('MONGO_PORT', 27017);
        const username = this.configService.get('MONGO_USERNAME', '');
        const password = this.configService.get('MONGO_PASSWORD', '');
        const database = this.configService.get('MONGO_DATABASE', 'cleanarchi');
        if (username && password) {
            return `mongodb://${username}:${password}@${host}:${port}/${database}`;
        }
        return `mongodb://${host}:${port}/${database}`;
    }
    getLogLevel() {
        return this.configService.get('LOG_LEVEL', 'info');
    }
    isProductionLogging() {
        return this.getEnvironment() === 'production';
    }
    getCorsOrigins() {
        const origins = this.configService.get('CORS_ORIGINS', 'http://localhost:3000');
        return origins.split(',').map((origin) => origin.trim());
    }
    getCorsCredentials() {
        return this.configService.get('CORS_CREDENTIALS', true);
    }
    getHelmetConfig() {
        return {
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: false,
        };
    }
    getCompressionConfig() {
        return {
            level: this.configService.get('COMPRESSION_LEVEL', 6),
            threshold: this.configService.get('COMPRESSION_THRESHOLD', 1024),
        };
    }
    getRateLimitConfig() {
        return {
            windowMs: this.getRateLimitWindowMs(),
            max: this.getRateLimitMax(),
            message: 'Too many requests from this IP, please try again later.',
        };
    }
    getBodyParserConfig() {
        return {
            limit: this.configService.get('BODY_PARSER_LIMIT', '50mb'),
            extended: true,
        };
    }
    isProduction() {
        return this.getEnvironment() === 'production';
    }
    isDevelopment() {
        return this.getEnvironment() === 'development';
    }
    isTest() {
        return this.getEnvironment() === 'test';
    }
    getRateLimitMax() {
        return this.configService.get('RATE_LIMIT_MAX', 100);
    }
    getRateLimitWindowMs() {
        return this.configService.get('RATE_LIMIT_WINDOW_MS', 900000);
    }
    isSwaggerEnabled() {
        return this.getEnvironment() !== 'production';
    }
    getSwaggerPath() {
        return this.configService.get('SWAGGER_PATH', 'api/docs');
    }
    isFeatureEnabled(featureName) {
        return this.configService.get(`FEATURE_${featureName.toUpperCase()}`, false);
    }
    getEmailHost() {
        return this.configService.get('EMAIL_HOST', '');
    }
    getEmailPort() {
        return this.configService.get('EMAIL_PORT', 587);
    }
    getEmailUser() {
        return this.configService.get('EMAIL_USER', '');
    }
    getEmailPassword() {
        return this.configService.get('EMAIL_PASSWORD', '');
    }
    getHealthCheckTimeout() {
        return this.configService.get('HEALTH_CHECK_TIMEOUT', 5000);
    }
    getHealthCheckInterval() {
        return this.configService.get('HEALTH_CHECK_INTERVAL', 30000);
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
//# sourceMappingURL=app-config.service.js.map