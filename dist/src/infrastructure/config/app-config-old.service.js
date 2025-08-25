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
            throw new Error('REFRESH_TOKEN_SECRET must be different from ACCESS_TOKEN_SECRET for security.');
        }
        return secret;
    }
    getJwtIssuer() {
        return process.env.JWT_ISSUER || 'clean-arch-app';
    }
    getJwtAudience() {
        return process.env.JWT_AUDIENCE || 'clean-arch-users';
    }
    getAccessTokenAlgorithm() {
        return process.env.ACCESS_TOKEN_ALGORITHM || 'HS256';
    }
    getRefreshTokenAlgorithm() {
        return process.env.REFRESH_TOKEN_ALGORITHM || 'HS256';
    }
    getPasswordHashAlgorithm() {
        return process.env.PASSWORD_HASH_ALGORITHM || 'bcrypt';
    }
    getBcryptRounds() {
        const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
        if (rounds < 4 || rounds > 20) {
            throw new Error('BCRYPT_ROUNDS must be between 4 and 20. Recommended: 12 for production, 10 for development.');
        }
        return rounds;
    }
    getEnvironment() {
        return process.env.NODE_ENV || 'development';
    }
    getDatabaseType() {
        const dbType = process.env.DATABASE_TYPE || 'postgresql';
        if (!['postgresql', 'mongodb', 'mysql', 'sqlite'].includes(dbType)) {
            throw new Error(`Unsupported DATABASE_TYPE: ${dbType}. Supported: postgresql, mongodb, mysql, sqlite`);
        }
        return dbType;
    }
    getDatabaseHost() {
        return process.env.DATABASE_HOST || 'localhost';
    }
    getDatabasePort() {
        return parseInt(process.env.DATABASE_PORT || '5432', 10);
    }
    getDatabaseUsername() {
        return process.env.DATABASE_USERNAME || 'admin';
    }
    getDatabasePassword() {
        const password = process.env.DATABASE_PASSWORD;
        if (!password) {
            throw new Error('DATABASE_PASSWORD is required. Please set this environment variable.');
        }
        return password;
    }
    getDatabaseName() {
        return process.env.DATABASE_NAME || 'cleanarchi';
    }
    getDatabasePoolSize() {
        return parseInt(process.env.DATABASE_POOL_SIZE || '10', 10);
    }
    getRedisHost() {
        return process.env.REDIS_HOST || 'localhost';
    }
    getRedisPort() {
        return parseInt(process.env.REDIS_PORT || '6379', 10);
    }
    getRedisPassword() {
        return process.env.REDIS_PASSWORD || '';
    }
    getPort() {
        return parseInt(process.env.PORT || '3000', 10);
    }
    getHost() {
        return process.env.HOST || '0.0.0.0';
    }
    getCorsOrigins() {
        const origins = process.env.CORS_ORIGINS;
        if (!origins) {
            return this.getEnvironment() === 'production'
                ? []
                : [
                    'http://localhost:3000',
                    'http://localhost:4200',
                    'http://localhost:8080',
                ];
        }
        return origins.split(',').map((origin) => origin.trim());
    }
    getCorsCredentials() {
        return process.env.CORS_CREDENTIALS === 'true';
    }
    getHelmetConfig() {
        const isDevelopment = this.getEnvironment() === 'development';
        return {
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    objectSrc: ["'none'"],
                    upgradeInsecureRequests: [],
                },
            },
            crossOriginEmbedderPolicy: !isDevelopment,
            crossOriginOpenerPolicy: {
                policy: 'same-origin-allow-popups',
            },
            crossOriginResourcePolicy: {
                policy: 'cross-origin',
            },
            dnsPrefetchControl: { allow: false },
            frameguard: { action: 'deny' },
            hidePoweredBy: true,
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true,
            },
            ieNoOpen: true,
            noSniff: true,
            originAgentCluster: true,
            permittedCrossDomainPolicies: false,
            referrerPolicy: {
                policy: 'no-referrer',
            },
            xssFilter: true,
        };
    }
    getCompressionConfig() {
        return {
            filter: () => {
                return true;
            },
            level: this.getEnvironment() === 'production' ? 6 : 1,
            threshold: 1024,
        };
    }
    getRateLimitConfig() {
        const isDevelopment = this.getEnvironment() === 'development';
        return {
            windowMs: 15 * 60 * 1000,
            max: isDevelopment ? 1000 : 100,
            message: 'Too many requests from this IP, please try again later',
            standardHeaders: true,
            legacyHeaders: false,
        };
    }
    getBodyParserConfig() {
        return {
            json: { limit: '50mb' },
            urlencoded: { limit: '50mb', extended: true },
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
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppConfigService);
//# sourceMappingURL=app-config-old.service.js.map