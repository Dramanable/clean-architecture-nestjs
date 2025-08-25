import { IEmailService } from '../../application/ports/email.port';
import type { I18nService } from '../../application/ports/i18n.port';
import { Logger } from '../../application/ports/logger.port';
import { IPasswordGenerator } from '../../application/ports/password-generator.port';
export interface OnboardingContext {
    userId: string;
    userName: string;
    userEmail: string;
    requestingUserId: string;
}
export interface OnboardingResult {
    temporaryPassword: string;
    emailSent: boolean;
    auditEvents: string[];
}
export declare class UserOnboardingService {
    private readonly emailService;
    private readonly passwordGenerator;
    private readonly logger;
    private readonly i18n;
    constructor(emailService: IEmailService, passwordGenerator: IPasswordGenerator, logger: Logger, i18n: I18nService);
    processUserOnboarding(context: OnboardingContext): Promise<OnboardingResult>;
    private generateSecurePassword;
    private sendWelcomeEmailSafely;
    private auditOnboardingProcess;
    private generateLoginUrl;
}
