import { IEmailService } from '../ports/email.port';
import type { I18nService } from '../ports/i18n.port';
import { Logger } from '../ports/logger.port';
import { IPasswordGenerator } from '../ports/password-generator.port';
import { CreateUserRequest, CreateUserResponse, CreateUserUseCase } from '../use-cases/users/create-user.use-case';
export interface UserOnboardingRequest extends CreateUserRequest {
    sendWelcomeEmail?: boolean;
    password?: string;
}
export interface UserOnboardingResponse extends CreateUserResponse {
    onboardingStatus: {
        passwordGenerated: boolean;
        emailSent: boolean;
        auditEvents: string[];
    };
}
export declare class UserOnboardingApplicationService {
    private readonly createUserUseCase;
    private readonly emailService;
    private readonly passwordGenerator;
    private readonly logger;
    private readonly i18n;
    constructor(createUserUseCase: CreateUserUseCase, emailService: IEmailService, passwordGenerator: IPasswordGenerator, logger: Logger, i18n: I18nService);
    createUserWithOnboarding(request: UserOnboardingRequest): Promise<UserOnboardingResponse>;
    private generateTemporaryPassword;
    private sendWelcomeEmail;
    private generateLoginUrl;
}
