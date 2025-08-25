import { IEmailService } from '../ports/email.port';
import type { I18nService } from '../ports/i18n.port';
import { Logger } from '../ports/logger.port';
import { IPasswordGenerator } from '../ports/password-generator.port';
import { CreateUserRequest, CreateUserResponse } from '../use-cases/users/create-user.use-case';
export interface OnboardingStrategy {
    execute(user: CreateUserResponse, request: CreateUserRequest): Promise<OnboardingResult>;
}
export interface OnboardingResult {
    emailSent: boolean;
    passwordGenerated: boolean;
    auditEvents: string[];
}
export declare class EmailOnboardingStrategy implements OnboardingStrategy {
    private readonly emailService;
    private readonly passwordGenerator;
    private readonly logger;
    private readonly i18n;
    constructor(emailService: IEmailService, passwordGenerator: IPasswordGenerator, logger: Logger, i18n: I18nService);
    execute(user: CreateUserResponse, request: CreateUserRequest): Promise<OnboardingResult>;
}
export declare class ManualOnboardingStrategy implements OnboardingStrategy {
    private readonly logger;
    private readonly i18n;
    constructor(logger: Logger, i18n: I18nService);
    execute(user: CreateUserResponse, request: CreateUserRequest): Promise<OnboardingResult>;
}
export declare class OnboardingContext {
    private strategy;
    constructor(strategy: OnboardingStrategy);
    setStrategy(strategy: OnboardingStrategy): void;
    executeOnboarding(user: CreateUserResponse, request: CreateUserRequest): Promise<OnboardingResult>;
}
export declare class OnboardingStrategyFactory {
    static createEmailStrategy(emailService: IEmailService, passwordGenerator: IPasswordGenerator, logger: Logger, i18n: I18nService): EmailOnboardingStrategy;
    static createManualStrategy(logger: Logger, i18n: I18nService): ManualOnboardingStrategy;
}
