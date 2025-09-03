/**
 * 🏗️ INFRASTRUCTURE MODULE - Repository Configuration
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { I18nService } from '../application/ports/i18n.port';
import { UserOnboardingApplicationService } from '../application/services/user-onboarding.application-service';
import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/auth/refresh-token.use-case';
import { TOKENS } from '../shared/constants/injection-tokens';
import { AppConfigService } from './config/app-config.service';
import { RefreshTokenOrmEntity } from './database/entities/typeorm/refresh-token.entity';
import { UserOrmEntity } from './database/entities/typeorm/user.entity';
import { UserMapper } from './database/mappers/typeorm-user.mapper';
import { TypeOrmRefreshTokenRepository } from './database/repositories/typeorm-refresh-token.repository';
import { TypeOrmUserRepository } from './database/repositories/typeorm-user.repository';
import { MockEmailService } from './email/mock-email.service';
import { PinoLoggerModule } from './logging/pino-logger.module';
import { MockPasswordGenerator } from './security/mock-password-generator.service';
import { BcryptPasswordService } from './services/bcrypt-password.service';
import { JwtTokenService } from './services/jwt-token.service';
import { CacheModule } from './cache/cache.module';

class InfrastructureI18nService implements I18nService {
  t(key: string, params?: Record<string, unknown>): string {
    const translations: Record<string, string> = {
      'operations.refresh_token.lookup_attempt': 'Looking up refresh token',
      'operations.refresh_token.lookup_success':
        'Refresh token found successfully',
      'operations.refresh_token.save_attempt': 'Saving refresh token',
      'operations.refresh_token.save_success':
        'Refresh token saved successfully',
      'operations.refresh_token.find_by_token_attempt': 'Finding token by hash',
      'operations.refresh_token.find_by_token_success': 'Token found by hash',
      'operations.login.attempt': 'User login attempt',
      'operations.login.success': 'User login successful',
      'operations.login.user_cached': 'User cached in Redis after login',
      'warnings.refresh_token.token_not_found': 'Refresh token not found',
      'warnings.login.user_not_found': 'User not found during login',
      'warnings.login.invalid_password': 'Invalid password during login',
      'warnings.login.token_revocation_failed':
        'Failed to revoke old tokens during login',
      'warnings.login.user_cache_failed':
        'Failed to cache user in Redis after login',
      'errors.refresh_token.lookup_failed': 'Failed to lookup refresh token',
      'errors.refresh_token.save_failed': 'Failed to save refresh token',
      'errors.refresh_token.find_by_token_failed':
        'Failed to find token by hash',
      'errors.login.user_lookup_failed': 'Failed to lookup user during login',
      'errors.login.invalid_credentials': 'Invalid credentials provided',
      'errors.login.token_save_failed': 'Failed to save refresh token',
      'errors.login.unexpected_error': 'Unexpected error during login',
    };

    let result = translations[key] || key;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value));
      });
    }
    return result;
  }

  translate(key: string, params?: Record<string, unknown>): string {
    return this.t(key, params);
  }

  setDefaultLanguage(): void {
    // Mock implementation
  }

  exists(): boolean {
    return true; // Mock - always exists
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, RefreshTokenOrmEntity]),
    CacheModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    PinoLoggerModule,
  ],
  providers: [
    UserMapper,
    { provide: TOKENS.USER_MAPPER, useClass: UserMapper },
    TypeOrmUserRepository,
    { provide: TOKENS.USER_REPOSITORY, useClass: TypeOrmUserRepository },
    TypeOrmRefreshTokenRepository,
    {
      provide: TOKENS.REFRESH_TOKEN_REPOSITORY,
      useClass: TypeOrmRefreshTokenRepository,
    },
    { provide: TOKENS.LOGIN_USE_CASE, useClass: LoginUseCase },
    { provide: TOKENS.REFRESH_TOKEN_USE_CASE, useClass: RefreshTokenUseCase },
    { provide: TOKENS.LOGOUT_USE_CASE, useClass: LogoutUseCase },
    { provide: TOKENS.JWT_TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: TOKENS.TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: TOKENS.PASSWORD_SERVICE, useClass: BcryptPasswordService },
    {
      provide: TOKENS.BCRYPT_PASSWORD_SERVICE,
      useClass: BcryptPasswordService,
    },
    {
      provide: TOKENS.USER_ONBOARDING_SERVICE,
      useClass: UserOnboardingApplicationService,
    },
    { provide: TOKENS.EMAIL_SERVICE, useClass: MockEmailService },
    { provide: TOKENS.PASSWORD_GENERATOR, useClass: MockPasswordGenerator },
    AppConfigService,
    { provide: TOKENS.APP_CONFIG, useClass: AppConfigService },
    { provide: TOKENS.CONFIG_SERVICE, useClass: AppConfigService },
    { provide: TOKENS.I18N_SERVICE, useClass: InfrastructureI18nService },
  ],
  exports: [
    TOKENS.USER_REPOSITORY,
    TOKENS.USER_MAPPER,
    TOKENS.REFRESH_TOKEN_REPOSITORY,
    TOKENS.LOGIN_USE_CASE,
    TOKENS.REFRESH_TOKEN_USE_CASE,
    TOKENS.LOGOUT_USE_CASE,
    TOKENS.JWT_TOKEN_SERVICE,
    TOKENS.PASSWORD_SERVICE,
    TOKENS.USER_ONBOARDING_SERVICE,
    TOKENS.EMAIL_SERVICE,
    TOKENS.PASSWORD_GENERATOR,
    TOKENS.CONFIG_SERVICE,
    TypeOrmUserRepository,
    UserMapper,
    AppConfigService,
    PinoLoggerModule,
  ],
})
export class InfrastructureModule {}
