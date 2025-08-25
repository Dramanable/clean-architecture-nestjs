/**
 * 🏗️ INFRASTRUCTURE MODULE - Repository Configuration
 *
 * Module NestJS pour configurer les repositories avec injection correcte
 * Respecte la Clean Architecture en gérant les dépendances dans la couche présentation
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOnboardingApplicationService } from '../application/services/user-onboarding.application-service';
import { TOKENS } from '../shared/constants/injection-tokens';
import { AppConfigService } from './config/app-config.service';
import { UserOrmEntity } from './database/entities/typeorm/user.entity';
import { UserMapper } from './database/mappers/typeorm-user.mapper';
import { TypeOrmUserRepository } from './database/repositories/typeorm-user.repository';
import { MockEmailService } from './email/mock-email.service';
import { PinoLoggerModule } from './logging/pino-logger.module';
import { MockPasswordGenerator } from './security/mock-password-generator.service';

@Module({
  imports: [
    // 🗄️ Configuration TypeORM pour les entités
    TypeOrmModule.forFeature([UserOrmEntity]),

    // 📝 Module de logging
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
  ],
  exports: [
    TOKENS.USER_REPOSITORY,
    TOKENS.USER_MAPPER,
    TOKENS.USER_ONBOARDING_SERVICE,
    TOKENS.EMAIL_SERVICE,
    TOKENS.PASSWORD_GENERATOR,
    TypeOrmUserRepository,
    UserMapper,
    AppConfigService,
    PinoLoggerModule,
  ],
})
export class InfrastructureModule {}
