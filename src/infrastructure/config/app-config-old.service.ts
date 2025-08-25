/**
 * 🔧 Config Service Implementation
 *
 * Service de configuration basé sur les variables d'environnement
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IConfigService } from '../../application/ports/config.port';

@Injectable()
export class AppConfigService implements IConfigService {
  constructor(private readonly configService: ConfigService) {}

  getAccessTokenExpirationTime(): number {
    return this.configService.get<number>('ACCESS_TOKEN_EXPIRATION', 3600);
  }

  getRefreshTokenExpirationDays(): number {
    return this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_DAYS', 30);
  }

  getAccessTokenSecret(): string {
    const secret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
    if (!secret) {
      throw new Error(
        'ACCESS_TOKEN_SECRET is required. Please set this environment variable.',
      );
    }
    if (secret.length < 32) {
      throw new Error(
        'ACCESS_TOKEN_SECRET must be at least 32 characters long for security.',
      );
    }
    return secret;
  }

  getRefreshTokenSecret(): string {
    const secret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    if (!secret) {
      throw new Error(
        'REFRESH_TOKEN_SECRET is required. Please set this environment variable.',
      );
    }
    if (secret.length < 32) {
      throw new Error(
        'REFRESH_TOKEN_SECRET must be at least 32 characters long for security.',
      );
    }

    // Vérification de sécurité : les secrets doivent être différents
    if (secret === this.getAccessTokenSecret()) {
      throw new Error(
        'REFRESH_TOKEN_SECRET must be different from ACCESS_TOKEN_SECRET for security.',
      );
    }

    return secret;
  }

  getJwtIssuer(): string {
    return process.env.JWT_ISSUER || 'clean-arch-app';
  }

  getJwtAudience(): string {
    return process.env.JWT_AUDIENCE || 'clean-arch-users';
  }

  getAccessTokenAlgorithm(): string {
    return process.env.ACCESS_TOKEN_ALGORITHM || 'HS256';
  }

  getRefreshTokenAlgorithm(): string {
    return process.env.REFRESH_TOKEN_ALGORITHM || 'HS256';
  }

  getPasswordHashAlgorithm(): string {
    return process.env.PASSWORD_HASH_ALGORITHM || 'bcrypt';
  }

  getBcryptRounds(): number {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

    // Validation des rounds bcrypt
    if (rounds < 4 || rounds > 20) {
      throw new Error(
        'BCRYPT_ROUNDS must be between 4 and 20. Recommended: 12 for production, 10 for development.',
      );
    }

    return rounds;
  }

  getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }

  getDatabaseType(): 'postgresql' | 'mongodb' | 'mysql' | 'sqlite' {
    const dbType = process.env.DATABASE_TYPE || 'postgresql';

    if (!['postgresql', 'mongodb', 'mysql', 'sqlite'].includes(dbType)) {
      throw new Error(
        `Unsupported DATABASE_TYPE: ${dbType}. Supported: postgresql, mongodb, mysql, sqlite`,
      );
    }

    return dbType as 'postgresql' | 'mongodb' | 'mysql' | 'sqlite';
  }

  // 🐘 Database PostgreSQL Configuration
  getDatabaseHost(): string {
    return process.env.DATABASE_HOST || 'localhost';
  }

  getDatabasePort(): number {
    return parseInt(process.env.DATABASE_PORT || '5432', 10);
  }

  getDatabaseUsername(): string {
    return process.env.DATABASE_USERNAME || 'admin';
  }

  getDatabasePassword(): string {
    const password = process.env.DATABASE_PASSWORD;
    if (!password) {
      throw new Error(
        'DATABASE_PASSWORD is required. Please set this environment variable.',
      );
    }
    return password;
  }

  getDatabaseName(): string {
    return process.env.DATABASE_NAME || 'cleanarchi';
  }

  getDatabasePoolSize(): number {
    return parseInt(process.env.DATABASE_POOL_SIZE || '10', 10);
  }

  // ⚡ Redis Configuration
  getRedisHost(): string {
    return process.env.REDIS_HOST || 'localhost';
  }

  getRedisPort(): number {
    return parseInt(process.env.REDIS_PORT || '6379', 10);
  }

  getRedisPassword(): string {
    return process.env.REDIS_PASSWORD || '';
  }

  // 🌐 Server Configuration
  getPort(): number {
    return parseInt(process.env.PORT || '3000', 10);
  }

  getHost(): string {
    return process.env.HOST || '0.0.0.0';
  }

  // 🔒 Security Configuration
  getCorsOrigins(): string[] {
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

  getCorsCredentials(): boolean {
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
        policy: 'same-origin-allow-popups' as const,
      },
      crossOriginResourcePolicy: {
        policy: 'cross-origin' as const,
      },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' as const },
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
        policy: 'no-referrer' as const,
      },
      xssFilter: true,
    };
  }

  // 📦 Compression Configuration
  getCompressionConfig() {
    return {
      filter: () => {
        // Always compress in this implementation
        return true;
      },
      level: this.getEnvironment() === 'production' ? 6 : 1,
      threshold: 1024,
    };
  }

  // 📊 Rate Limiting Configuration
  getRateLimitConfig() {
    const isDevelopment = this.getEnvironment() === 'development';

    return {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isDevelopment ? 1000 : 100, // limit each IP
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    };
  }

  // 🎯 Request Configuration
  getBodyParserConfig() {
    return {
      json: { limit: '50mb' },
      urlencoded: { limit: '50mb', extended: true },
    };
  }

  // 🔧 Production/Development Flags
  isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  isDevelopment(): boolean {
    return this.getEnvironment() === 'development';
  }

  isTest(): boolean {
    return this.getEnvironment() === 'test';
  }
}
