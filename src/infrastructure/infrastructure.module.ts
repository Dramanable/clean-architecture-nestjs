/**
 * 🏗️ INFRASTRUCTURE MODULE - Repository Configuration
 *
 * Module NestJS pour configurer les repositories avec injection correcte
 * Respecte la Clean Architecture en gérant les dépendances dans la couche présentation
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

/**
 * 🌍 Mock I18n Service pour Infrastructure
 */
class InfrastructureI18nService implements I18nService {
  t(key: string, params?: Record<string, any>): string {
    const translations: Record<string, string> = {
      // Auth operations
      'operations.refresh_token.lookup_attempt': 'Looking up refresh token',
      'operations.refresh_token.lookup_success':
        'Refresh token found successfully',
      'operations.refresh_token.save_attempt': 'Saving refresh token',
      'operations.refresh_token.save_success':
        'Refresh token saved successfully',
      'operations.refresh_token.find_by_token_attempt': 'Finding token by hash',
      'operations.refresh_token.find_by_token_success': 'Token found by hash',
      // Warnings
      'warnings.refresh_token.token_not_found': 'Refresh token not found',
      // Errors
      'errors.refresh_token.lookup_failed': 'Failed to lookup refresh token',
      'errors.refresh_token.save_failed': 'Failed to save refresh token',
      'errors.refresh_token.find_by_token_failed':
        'Failed to find token by hash',
    };

    let result = translations[key] || key;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(`{${param}}`, String(value));
      });
    }
    return result;
  }

  translate(key: string, params?: Record<string, any>): string {
    return this.t(key, params);
  }

  setDefaultLanguage(): void {
    // Mock implementation
  }

  exists(key: string): boolean {
    return true; // Mock - always exists
  }
}

@Module({
  imports: [
    // 🗄️ Configuration TypeORM pour les entités
    TypeOrmModule.forFeature([UserOrmEntity, RefreshTokenOrmEntity]),

    // � JWT Module
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default-secret-key',
      signOptions: { expiresIn: '1h' },
    }),

    // �📝 Module de logging
    PinoLoggerModule,
  ],
  providers: [
    // 🗂️ Mappers
    UserMapper,
    {
      provide: TOKENS.USER_MAPPER,
      useClass: UserMapper,
    },

    // 🏗️ Repositories
    TypeOrmUserRepository,
    {
      provide: TOKENS.USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    TypeOrmRefreshTokenRepository,
    {
      provide: TOKENS.REFRESH_TOKEN_REPOSITORY,
      useClass: TypeOrmRefreshTokenRepository,
    },

    // 🔐 Auth Use Cases
    {
      provide: TOKENS.LOGIN_USE_CASE,
      useClass: LoginUseCase,
    },
    {
      provide: TOKENS.REFRESH_TOKEN_USE_CASE,
      useClass: RefreshTokenUseCase,
    },
    {
      provide: TOKENS.LOGOUT_USE_CASE,
      useClass: LogoutUseCase,
    },

    // 🔑 Security Services
    {
      provide: TOKENS.JWT_TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    {
      provide: TOKENS.TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    {
      provide: TOKENS.PASSWORD_SERVICE,
      useClass: BcryptPasswordService,
    },
    {
      provide: TOKENS.BCRYPT_PASSWORD_SERVICE,
      useClass: BcryptPasswordService,
    },

    // 🎯 Application Services
    {
      provide: TOKENS.USER_ONBOARDING_SERVICE,
      useClass: UserOnboardingApplicationService,
    },

    // 📧 External Services (Mocks for development)
    {
      provide: TOKENS.EMAIL_SERVICE,
      useClass: MockEmailService,
    },
    {
      provide: TOKENS.PASSWORD_GENERATOR,
      useClass: MockPasswordGenerator,
    },

    // 🔧 Configuration Service
    AppConfigService,
    {
      provide: TOKENS.APP_CONFIG,
      useClass: AppConfigService,
    },
    {
      provide: TOKENS.CONFIG_SERVICE,
      useClass: AppConfigService,
    },

    // 🌍 I18n Service (Infrastructure Mock)
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: InfrastructureI18nService,
    },
  ],
  exports: [
    // 🗂️ Repositories
    TOKENS.USER_REPOSITORY,
    TOKENS.USER_MAPPER,
    TOKENS.REFRESH_TOKEN_REPOSITORY,

    // 🔐 Auth Use Cases
    TOKENS.LOGIN_USE_CASE,
    TOKENS.REFRESH_TOKEN_USE_CASE,
    TOKENS.LOGOUT_USE_CASE,

    // 🔑 Security Services
    TOKENS.JWT_TOKEN_SERVICE,
    TOKENS.PASSWORD_SERVICE,

    // 🎯 Application Services
    TOKENS.USER_ONBOARDING_SERVICE,
    TOKENS.EMAIL_SERVICE,
    TOKENS.PASSWORD_GENERATOR,

    // 🔧 Configuration & Logging
    TypeOrmUserRepository,
    UserMapper,
    AppConfigService,
    PinoLoggerModule,
  ],
})
export class InfrastructureModule {}
