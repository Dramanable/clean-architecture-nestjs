"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOnboardingApplicationService = void 0;
const application_exceptions_1 = require("../exceptions/application.exceptions");
class UserOnboardingApplicationService {
    createUserUseCase;
    emailService;
    passwordGenerator;
    logger;
    i18n;
    constructor(createUserUseCase, emailService, passwordGenerator, logger, i18n) {
        this.createUserUseCase = createUserUseCase;
        this.emailService = emailService;
        this.passwordGenerator = passwordGenerator;
        this.logger = logger;
        this.i18n = i18n;
    }
    async createUserWithOnboarding(request) {
        this.logger.info(this.i18n.t('operations.user.onboarding_started', {
            email: request.email,
        }), {
            requestingUserId: request.requestingUserId,
            targetEmail: request.email,
            sendEmail: request.sendWelcomeEmail ?? true,
        });
        try {
            const userResult = await this.createUserUseCase.execute(request);
            let temporaryPassword;
            if (request.sendWelcomeEmail !== false) {
                temporaryPassword = await this.generateTemporaryPassword(userResult, request.requestingUserId);
            }
            let emailSent = false;
            if (request.sendWelcomeEmail && temporaryPassword) {
                emailSent = await this.sendWelcomeEmail({
                    id: userResult.id,
                    email: userResult.email,
                    name: userResult.name,
                }, temporaryPassword, request.requestingUserId);
            }
            const auditEvents = ['user_created'];
            if (request.sendWelcomeEmail !== false) {
                auditEvents.push(temporaryPassword ? 'password_generated' : 'no_password_needed');
                auditEvents.push(emailSent ? 'email_sent' : 'email_failed');
            }
            this.logger.info(this.i18n.t('success.user.onboarding_completed', {
                userId: userResult.id,
                email: userResult.email,
            }), {
                userId: userResult.id,
                emailSent,
                auditEvents,
            });
            this.logger.audit(this.i18n.t('audit.user_onboarding_process'), request.requestingUserId, {
                targetUserId: userResult.id,
                targetEmail: userResult.email,
                passwordGenerated: !!temporaryPassword,
                emailSent,
                processSteps: auditEvents,
                completedAt: new Date().toISOString(),
            });
            return {
                ...userResult,
                onboardingStatus: {
                    passwordGenerated: !!temporaryPassword,
                    emailSent,
                    auditEvents,
                },
            };
        }
        catch (error) {
            const orchestrationError = new application_exceptions_1.WorkflowOrchestrationError('UserOnboarding', 'execute', error.message);
            this.logger.error(this.i18n.t('errors.user.onboarding_failed', {
                email: request.email,
                error: orchestrationError.message,
            }), orchestrationError, {
                requestingUserId: request.requestingUserId,
                targetEmail: request.email,
                errorCode: orchestrationError.code,
            });
            throw orchestrationError;
        }
    }
    async generateTemporaryPassword(user, requestingUserId) {
        try {
            const password = await this.passwordGenerator.generateTemporaryPassword();
            this.logger.audit(this.i18n.t('audit.password_generated'), requestingUserId, {
                targetUserId: user.id,
                targetEmail: user.email,
                timestamp: new Date().toISOString(),
            });
            return password;
        }
        catch (error) {
            throw new application_exceptions_1.PasswordGenerationError(error.message);
        }
    }
    async sendWelcomeEmail(user, temporaryPassword, requestingUserId) {
        try {
            await this.emailService.sendWelcomeEmail(user.email, user.name, temporaryPassword, this.generateLoginUrl());
            this.logger.info(this.i18n.t('success.email.welcome_sent', {
                email: user.email,
            }), {
                targetUserId: user.id,
            });
            this.logger.audit(this.i18n.t('audit.welcome_email_sent'), requestingUserId, {
                targetUserId: user.id,
                targetEmail: user.email,
                emailDelivered: true,
                timestamp: new Date().toISOString(),
            });
            return true;
        }
        catch (emailError) {
            const serviceError = new application_exceptions_1.ExternalServiceError('EmailService', 'sendWelcomeEmail', emailError);
            this.logger.warn(this.i18n.t('warnings.email.delivery_failed', {
                email: user.email,
                error: serviceError.message,
            }), {
                targetUserId: user.id,
                emailError: serviceError.message,
                serviceErrorCode: serviceError.code,
            });
            return false;
        }
    }
    generateLoginUrl() {
        return process.env.APP_LOGIN_URL || 'https://app.company.com/login';
    }
}
exports.UserOnboardingApplicationService = UserOnboardingApplicationService;
//# sourceMappingURL=user-onboarding.application-service.js.map