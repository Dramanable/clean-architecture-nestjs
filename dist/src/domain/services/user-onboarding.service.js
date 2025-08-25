"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOnboardingService = void 0;
class UserOnboardingService {
    emailService;
    passwordGenerator;
    logger;
    i18n;
    constructor(emailService, passwordGenerator, logger, i18n) {
        this.emailService = emailService;
        this.passwordGenerator = passwordGenerator;
        this.logger = logger;
        this.i18n = i18n;
    }
    async processUserOnboarding(context) {
        const auditEvents = [];
        try {
            const temporaryPassword = await this.generateSecurePassword(context);
            auditEvents.push('password_generated');
            const emailSent = await this.sendWelcomeEmailSafely(context, temporaryPassword);
            auditEvents.push(emailSent ? 'email_sent' : 'email_failed');
            this.auditOnboardingProcess(context, emailSent, auditEvents);
            return {
                temporaryPassword,
                emailSent,
                auditEvents,
            };
        }
        catch (error) {
            this.logger.error(this.i18n.t('domain.onboarding.process_failed'), error, { context, auditEvents });
            throw error;
        }
    }
    async generateSecurePassword(context) {
        this.logger.debug(this.i18n.t('domain.onboarding.password_generation'), context);
        const password = await this.passwordGenerator.generateTemporaryPassword();
        this.logger.audit(this.i18n.t('audit.password_generated'), context.requestingUserId, {
            targetUserId: context.userId,
            targetEmail: context.userEmail,
            timestamp: new Date().toISOString(),
        });
        return password;
    }
    async sendWelcomeEmailSafely(context, temporaryPassword) {
        try {
            await this.emailService.sendWelcomeEmail(context.userEmail, context.userName, temporaryPassword, this.generateLoginUrl());
            this.logger.audit(this.i18n.t('audit.welcome_email_sent'), context.requestingUserId, {
                targetUserId: context.userId,
                targetEmail: context.userEmail,
                emailDelivered: true,
                timestamp: new Date().toISOString(),
            });
            return true;
        }
        catch (emailError) {
            this.logger.warn(this.i18n.t('warnings.email.delivery_failed', {
                email: context.userEmail,
                error: emailError.message,
            }), {
                context,
                emailError: emailError.message,
            });
            this.logger.audit(this.i18n.t('audit.welcome_email_failed'), context.requestingUserId, {
                targetUserId: context.userId,
                targetEmail: context.userEmail,
                emailDelivered: false,
                errorMessage: emailError.message,
                timestamp: new Date().toISOString(),
            });
            return false;
        }
    }
    auditOnboardingProcess(context, emailSent, auditEvents) {
        this.logger.audit(this.i18n.t('audit.user_onboarding_completed'), context.requestingUserId, {
            targetUserId: context.userId,
            targetEmail: context.userEmail,
            emailDelivered: emailSent,
            processSteps: auditEvents,
            completedAt: new Date().toISOString(),
        });
    }
    generateLoginUrl() {
        return process.env.APP_LOGIN_URL || 'https://app.company.com/login';
    }
}
exports.UserOnboardingService = UserOnboardingService;
//# sourceMappingURL=user-onboarding.service.js.map