import { ConfigService } from '@nestjs/config';
import { IConfigService } from '../../application/ports/config.port';
export declare class AppConfigService implements IConfigService {
    private readonly configService;
    constructor(configService: ConfigService);
    getAccessTokenExpirationTime(): number;
    getRefreshTokenExpirationDays(): number;
    getAccessTokenSecret(): string;
    getRefreshTokenSecret(): string;
    getJwtIssuer(): string;
    getJwtAudience(): string;
    getAccessTokenAlgorithm(): string;
    getRefreshTokenAlgorithm(): string;
    getPasswordHashAlgorithm(): string;
    getBcryptRounds(): number;
    getEnvironment(): string;
    getDatabaseType(): 'postgresql' | 'mongodb' | 'mysql' | 'sqlite';
    getDatabaseHost(): string;
    getDatabasePort(): number;
    getDatabaseUsername(): string;
    getDatabasePassword(): string;
    getDatabaseName(): string;
    getDatabasePoolSize(): number;
    getRedisHost(): string;
    getRedisPort(): number;
    getRedisPassword(): string;
    getPort(): number;
    getHost(): string;
    getCorsOrigins(): string[];
    getCorsCredentials(): boolean;
    getHelmetConfig(): {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: string[];
                styleSrc: string[];
                scriptSrc: string[];
                objectSrc: string[];
                upgradeInsecureRequests: never[];
            };
        };
        crossOriginEmbedderPolicy: boolean;
        crossOriginOpenerPolicy: {
            policy: "same-origin-allow-popups";
        };
        crossOriginResourcePolicy: {
            policy: "cross-origin";
        };
        dnsPrefetchControl: {
            allow: boolean;
        };
        frameguard: {
            action: "deny";
        };
        hidePoweredBy: boolean;
        hsts: {
            maxAge: number;
            includeSubDomains: boolean;
            preload: boolean;
        };
        ieNoOpen: boolean;
        noSniff: boolean;
        originAgentCluster: boolean;
        permittedCrossDomainPolicies: boolean;
        referrerPolicy: {
            policy: "no-referrer";
        };
        xssFilter: boolean;
    };
    getCompressionConfig(): {
        filter: () => boolean;
        level: number;
        threshold: number;
    };
    getRateLimitConfig(): {
        windowMs: number;
        max: number;
        message: string;
        standardHeaders: boolean;
        legacyHeaders: boolean;
    };
    getBodyParserConfig(): {
        json: {
            limit: string;
        };
        urlencoded: {
            limit: string;
            extended: boolean;
        };
    };
    isProduction(): boolean;
    isDevelopment(): boolean;
    isTest(): boolean;
}
