"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserWithEmailUseCase = void 0;
const create_user_use_case_1 = require("./create-user.use-case");
class CreateUserWithEmailUseCase extends create_user_use_case_1.CreateUserUseCase {
    emailService;
    passwordGenerator;
    constructor(userRepository, logger, i18n, emailService, passwordGenerator) {
        super(userRepository, logger, i18n);
        this.emailService = emailService;
        this.passwordGenerator = passwordGenerator;
    }
    async execute(request) {
        const startTime = Date.now();
        const requestContext = {
            operation: 'CreateUserWithEmail',
            requestingUserId: request.requestingUserId,
            targetEmail: request.email,
            targetRole: request.role,
        };
        this.logger.info(this.i18n.t('operations.user.creation_with_email_attempt'), requestContext);
        try {
            this.logger.debug(this.i18n.t('operations.password.generation_attempt'), requestContext);
            const temporaryPassword = await this.passwordGenerator.generateTemporaryPassword();
            this.logger.audit(this.i18n.t('audit.password_generated'), request.requestingUserId, {
                targetEmail: request.email,
                passwordGenerated: true,
                timestamp: new Date().toISOString(),
            });
            const userCreationResult = await super.execute(request);
            try {
                await this.emailService.sendWelcomeEmail(userCreationResult.email, userCreationResult.name, temporaryPassword, this.generateLoginUrl());
                this.logger.audit(this.i18n.t('audit.welcome_email_sent'), request.requestingUserId, {
                    targetUserId: userCreationResult.id,
                    targetEmail: userCreationResult.email,
                    emailDelivered: true,
                    timestamp: new Date().toISOString(),
                });
                this.logger.info(this.i18n.t('success.user.creation_with_email_success', {
                    email: userCreationResult.email,
                    userId: userCreationResult.id,
                }), { ...requestContext, userId: userCreationResult.id });
            }
            catch (emailError) {
                this.logger.warn(this.i18n.t('warnings.email.delivery_failed', {
                    email: userCreationResult.email,
                    error: emailError.message,
                }), {
                    ...requestContext,
                    userId: userCreationResult.id,
                    emailError: emailError.message,
                });
                this.logger.audit(this.i18n.t('audit.welcome_email_failed'), request.requestingUserId, {
                    targetUserId: userCreationResult.id,
                    targetEmail: userCreationResult.email,
                    emailDelivered: false,
                    errorMessage: emailError.message,
                    timestamp: new Date().toISOString(),
                });
            }
            const duration = Date.now() - startTime;
            this.logger.info(this.i18n.t('operations.completed', {
                operation: 'CreateUserWithEmail',
                duration: `${duration}ms`,
            }), { ...requestContext, duration });
            return userCreationResult;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(this.i18n.t('operations.failed', { operation: 'CreateUserWithEmail' }), error, { ...requestContext, duration });
            throw error;
        }
    }
    generateLoginUrl() {
        return process.env.APP_LOGIN_URL || 'https://app.company.com/login';
    }
}
exports.CreateUserWithEmailUseCase = CreateUserWithEmailUseCase;
//# sourceMappingURL=create-user-with-email.use-case.js.map