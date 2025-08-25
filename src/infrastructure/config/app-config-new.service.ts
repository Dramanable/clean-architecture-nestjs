/**
 * 🔧 Config Service Implementation
 *
 * Service de configuration basé sur @nestjs/config
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
        'REFRESH_TOKEN_SECRET must be different from ACCESS_TOKEN_SECRET for security reasons.',
      );
    }

    return secret;
  }

  getJwtIssuer(): string {
    return this.configService.get<string>('JWT_ISSUER', 'clean-arch-app');
  }

  getJwtAudience(): string {
    return this.configService.get<string>('JWT_AUDIENCE', 'clean-arch-users');
  }

  getAccessTokenAlgorithm(): string {
    return this.configService.get<string>('ACCESS_TOKEN_ALGORITHM', 'HS256');
  }

  getRefreshTokenAlgorithm(): string {
    return this.configService.get<string>('REFRESH_TOKEN_ALGORITHM', 'HS256');
  }

  getPasswordHashAlgorithm(): string {
    return this.configService.get<string>('PASSWORD_HASH_ALGORITHM', 'bcrypt');
  }

  getBcryptRounds(): number {
    const rounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    if (rounds < 10 || rounds > 20) {
      throw new Error(
        'BCRYPT_ROUNDS must be between 10 and 20 for security and performance balance.',
      );
    }
    return rounds;
  }

  // 🌍 Environment Configuration
  getEnvironment(): 'development' | 'test' | 'production' {
    return this.configService.get<string>('NODE_ENV', 'development') as
      | 'development'
      | 'test'
      | 'production';
  }

  getDatabaseType(): 'postgresql' | 'mongodb' | 'mysql' | 'sqlite' {
    const dbType = this.configService.get<string>(
      'DATABASE_TYPE',
      'postgresql',
    );
    if (!['postgresql', 'mongodb', 'mysql', 'sqlite'].includes(dbType)) {
      throw new Error(
        `Unsupported DATABASE_TYPE: ${dbType}. Supported: postgresql, mongodb, mysql, sqlite`,
      );
    }
    return dbType as 'postgresql' | 'mongodb' | 'mysql' | 'sqlite';
  }

  // 🐘 Database PostgreSQL Configuration
  getDatabaseHost(): string {
    return this.configService.get<string>('DATABASE_HOST', 'localhost');
  }

  getDatabasePort(): number {
    return this.configService.get<number>('DATABASE_PORT', 5432);
  }

  getDatabaseUsername(): string {
    return this.configService.get<string>('DATABASE_USERNAME', 'admin');
  }

  getDatabasePassword(): string {
    const password = this.configService.get<string>('DATABASE_PASSWORD');
    if (!password) {
      throw new Error(
        'DATABASE_PASSWORD is required. Please set this environment variable.',
      );
    }
    return password;
  }

  getDatabaseName(): string {
    return this.configService.get<string>('DATABASE_NAME', 'cleanarchi');
  }

  getDatabasePoolSize(): number {
    return this.configService.get<number>('DATABASE_POOL_SIZE', 10);
  }

  // 🍃 Redis Configuration
  getRedisHost(): string {
    return this.configService.get<string>('REDIS_HOST', 'localhost');
  }

  getRedisPort(): number {
    return this.configService.get<number>('REDIS_PORT', 6379);
  }

  getRedisPassword(): string {
    return this.configService.get<string>('REDIS_PASSWORD', '');
  }

  // 🌐 Server Configuration
  getPort(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  getHost(): string {
    return this.configService.get<string>('HOST', '0.0.0.0');
  }

  // 🗄️ MongoDB Configuration (alternative)
  getMongoConnectionString(): string {
    const host = this.configService.get<string>('MONGO_HOST', 'localhost');
    const port = this.configService.get<number>('MONGO_PORT', 27017);
    const username = this.configService.get<string>('MONGO_USERNAME', '');
    const password = this.configService.get<string>('MONGO_PASSWORD', '');
    const database = this.configService.get<string>(
      'MONGO_DATABASE',
      'cleanarchi',
    );

    if (username && password) {
      return `mongodb://${username}:${password}@${host}:${port}/${database}`;
    }
    return `mongodb://${host}:${port}/${database}`;
  }

  // 🔧 Logging Configuration
  getLogLevel(): string {
    return this.configService.get<string>('LOG_LEVEL', 'info');
  }

  isProductionLogging(): boolean {
    return this.getEnvironment() === 'production';
  }

  // 🔒 Security Configuration
  getCorsOrigins(): string[] {
    const origins = this.configService.get<string>(
      'CORS_ORIGINS',
      'http://localhost:3000',
    );
    return origins.split(',').map((origin) => origin.trim());
  }

  getRateLimitMax(): number {
    return this.configService.get<number>('RATE_LIMIT_MAX', 100);
  }

  getRateLimitWindowMs(): number {
    return this.configService.get<number>('RATE_LIMIT_WINDOW_MS', 900000); // 15 minutes
  }

  // 📊 Monitoring Configuration
  isSwaggerEnabled(): boolean {
    return this.getEnvironment() !== 'production';
  }

  getSwaggerPath(): string {
    return this.configService.get<string>('SWAGGER_PATH', 'api/docs');
  }

  // 🎯 Feature Flags
  isFeatureEnabled(featureName: string): boolean {
    return this.configService.get<boolean>(
      `FEATURE_${featureName.toUpperCase()}`,
      false,
    );
  }

  // 📧 Email Configuration (future)
  getEmailHost(): string {
    return this.configService.get<string>('EMAIL_HOST', '');
  }

  getEmailPort(): number {
    return this.configService.get<number>('EMAIL_PORT', 587);
  }

  getEmailUser(): string {
    return this.configService.get<string>('EMAIL_USER', '');
  }

  getEmailPassword(): string {
    return this.configService.get<string>('EMAIL_PASSWORD', '');
  }

  // � Security Configuration
  getCorsCredentials(): boolean {
    return this.configService.get<boolean>('CORS_CREDENTIALS', true);
  }

  getHelmetConfig(): any {
    return {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    };
  }

  // ⚡ Performance Configuration
  getCompressionConfig(): any {
    return {
      level: 6,
      threshold: 1024,
    };
  }

  getRateLimitConfig(): any {
    return {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    };
  }

  getBodyParserConfig(): any {
    return {
      limit: '10mb',
    };
  }

  // �🔄 Health Check Configuration
  getHealthCheckTimeout(): number {
    return this.configService.get<number>('HEALTH_CHECK_TIMEOUT', 5000);
  }

  getHealthCheckInterval(): number {
    return this.configService.get<number>('HEALTH_CHECK_INTERVAL', 30000);
  }

  // 🌍 Environment Flags
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
