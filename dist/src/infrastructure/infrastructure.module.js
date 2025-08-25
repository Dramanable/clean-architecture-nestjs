"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_onboarding_application_service_1 = require("../application/services/user-onboarding.application-service");
const injection_tokens_1 = require("../shared/constants/injection-tokens");
const app_config_service_1 = require("./config/app-config.service");
const user_entity_1 = require("./database/entities/typeorm/user.entity");
const typeorm_user_mapper_1 = require("./database/mappers/typeorm-user.mapper");
const typeorm_user_repository_1 = require("./database/repositories/typeorm-user.repository");
const mock_email_service_1 = require("./email/mock-email.service");
const pino_logger_module_1 = require("./logging/pino-logger.module");
const mock_password_generator_service_1 = require("./security/mock-password-generator.service");
let InfrastructureModule = class InfrastructureModule {
};
exports.InfrastructureModule = InfrastructureModule;
exports.InfrastructureModule = InfrastructureModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.UserOrmEntity]),
            pino_logger_module_1.PinoLoggerModule,
        ],
        providers: [
            typeorm_user_mapper_1.UserMapper,
            {
                provide: injection_tokens_1.TOKENS.USER_MAPPER,
                useClass: typeorm_user_mapper_1.UserMapper,
            },
            typeorm_user_repository_1.TypeOrmUserRepository,
            {
                provide: injection_tokens_1.TOKENS.USER_REPOSITORY,
                useClass: typeorm_user_repository_1.TypeOrmUserRepository,
            },
            {
                provide: injection_tokens_1.TOKENS.USER_ONBOARDING_SERVICE,
                useClass: user_onboarding_application_service_1.UserOnboardingApplicationService,
            },
            {
                provide: injection_tokens_1.TOKENS.EMAIL_SERVICE,
                useClass: mock_email_service_1.MockEmailService,
            },
            {
                provide: injection_tokens_1.TOKENS.PASSWORD_GENERATOR,
                useClass: mock_password_generator_service_1.MockPasswordGenerator,
            },
            app_config_service_1.AppConfigService,
        ],
        exports: [
            injection_tokens_1.TOKENS.USER_REPOSITORY,
            injection_tokens_1.TOKENS.USER_MAPPER,
            injection_tokens_1.TOKENS.USER_ONBOARDING_SERVICE,
            injection_tokens_1.TOKENS.EMAIL_SERVICE,
            injection_tokens_1.TOKENS.PASSWORD_GENERATOR,
            typeorm_user_repository_1.TypeOrmUserRepository,
            typeorm_user_mapper_1.UserMapper,
            app_config_service_1.AppConfigService,
            pino_logger_module_1.PinoLoggerModule,
        ],
    })
], InfrastructureModule);
//# sourceMappingURL=infrastructure.module.js.map