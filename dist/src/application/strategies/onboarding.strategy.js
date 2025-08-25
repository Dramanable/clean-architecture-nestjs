"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingStrategyFactory = exports.OnboardingContext = exports.ManualOnboardingStrategy = exports.EmailOnboardingStrategy = void 0;
class EmailOnboardingStrategy {
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
    async execute(user, request) {
        const auditEvents = [];
        const password = await this.passwordGenerator.generateTemporaryPassword();
        auditEvents.push('password_generated');
        this.logger.audit(this.i18n.t('audit.password_generated'), request.requestingUserId, { targetUserId: user.id, targetEmail: user.email });
        let emailSent = false;
        try {
            await this.emailService.sendWelcomeEmail(user.email, user.name, password, 'https://app.company.com/login');
            emailSent = true;
            auditEvents.push('email_sent');
            this.logger.audit(this.i18n.t('audit.welcome_email_sent'), request.requestingUserId, {
                targetUserId: user.id,
                targetEmail: user.email,
                emailDelivered: true,
            });
        }
        catch (error) {
            auditEvents.push('email_failed');
            this.logger.warn(this.i18n.t('warnings.email.delivery_failed'), {
                targetUserId: user.id,
                error: error.message,
            });
        }
        return {
            emailSent,
            passwordGenerated: true,
            auditEvents,
        };
    }
}
exports.EmailOnboardingStrategy = EmailOnboardingStrategy;
class ManualOnboardingStrategy {
    logger;
    i18n;
    constructor(logger, i18n) {
        this.logger = logger;
        this.i18n = i18n;
    }
    execute(user, request) {
        this.logger.audit(this.i18n.t('audit.manual_onboarding'), request.requestingUserId, { targetUserId: user.id, targetEmail: user.email });
        return Promise.resolve({
            emailSent: false,
            passwordGenerated: false,
            auditEvents: ['manual_onboarding'],
        });
    }
}
exports.ManualOnboardingStrategy = ManualOnboardingStrategy;
class OnboardingContext {
    strategy;
    constructor(strategy) {
        this.strategy = strategy;
    }
    setStrategy(strategy) {
        this.strategy = strategy;
    }
    async executeOnboarding(user, request) {
        return await this.strategy.execute(user, request);
    }
}
exports.OnboardingContext = OnboardingContext;
class OnboardingStrategyFactory {
    static createEmailStrategy(emailService, passwordGenerator, logger, i18n) {
        return new EmailOnboardingStrategy(emailService, passwordGenerator, logger, i18n);
    }
    static createManualStrategy(logger, i18n) {
        return new ManualOnboardingStrategy(logger, i18n);
    }
}
exports.OnboardingStrategyFactory = OnboardingStrategyFactory;
//# sourceMappingURL=onboarding.strategy.js.map