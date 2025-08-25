"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserWithProperExceptionsUseCase = void 0;
const user_entity_1 = require("../../../domain/entities/user.entity");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
const user_role_enum_1 = require("../../../shared/enums/user-role.enum");
const application_exceptions_1 = require("../../exceptions/application.exceptions");
class CreateUserWithProperExceptionsUseCase {
    userRepository;
    emailService;
    logger;
    i18n;
    constructor(userRepository, emailService, logger, i18n) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.logger = logger;
        this.i18n = i18n;
    }
    async execute(request) {
        const startTime = Date.now();
        const operationContext = {
            operation: 'CreateUserWithProperExceptions',
            requestingUserId: request.requestingUserId,
            targetEmail: request.email,
            correlationId: `create-user-${Date.now()}`,
        };
        this.logger.info(this.i18n.t('operations.user.creation_attempt'), operationContext);
        try {
            const requestingUser = await this.validateRequestingUser(request.requestingUserId, operationContext);
            await this.validatePermissions(requestingUser, request.role, operationContext);
            const validatedData = await this.validateUserData(request, operationContext);
            const user = await this.createUser(validatedData, operationContext);
            const emailSent = await this.sendWelcomeEmailIfRequested(user, request.sendWelcomeEmail, operationContext);
            const duration = Date.now() - startTime;
            this.logger.info(this.i18n.t('success.user.created'), {
                ...operationContext,
                userId: user.id,
                duration,
            });
            return {
                id: user.id,
                email: user.email.value,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                emailSent,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            if (error instanceof application_exceptions_1.ApplicationAuthorizationError ||
                error instanceof application_exceptions_1.ApplicationValidationError ||
                error instanceof application_exceptions_1.ExternalServiceError ||
                error instanceof application_exceptions_1.WorkflowOrchestrationError) {
                this.logger.error(this.i18n.t('errors.user.creation_failed'), error, {
                    ...operationContext,
                    duration,
                    errorType: error.constructor.name,
                });
                throw error;
            }
            const useCaseError = new application_exceptions_1.UseCaseExecutionError('CreateUserWithProperExceptions', `Unexpected error during user creation: ${error.message}`, error);
            this.logger.error(this.i18n.t('errors.user.creation_failed'), useCaseError, {
                ...operationContext,
                duration,
                originalError: error.message,
            });
            throw useCaseError;
        }
    }
    async validateRequestingUser(requestingUserId, context) {
        try {
            const requestingUser = await this.userRepository.findById(requestingUserId);
            if (!requestingUser) {
                throw new application_exceptions_1.ApplicationAuthorizationError('user-creation', 'create-user', requestingUserId, 'Requesting user not found');
            }
            return requestingUser;
        }
        catch (error) {
            if (error instanceof application_exceptions_1.ApplicationAuthorizationError) {
                throw error;
            }
            throw new application_exceptions_1.UseCaseExecutionError('CreateUserWithProperExceptions', `Failed to validate requesting user: ${error.message}`, error);
        }
    }
    async validatePermissions(requestingUser, targetRole, context) {
        try {
            if (!requestingUser.hasPermission(user_role_enum_1.Permission.CREATE_USER)) {
                throw new application_exceptions_1.ApplicationAuthorizationError('user-creation', 'create-user', requestingUser.id, `User lacks CREATE_USER permission`);
            }
            if (targetRole === user_role_enum_1.UserRole.SUPER_ADMIN &&
                requestingUser.role !== user_role_enum_1.UserRole.SUPER_ADMIN) {
                throw new application_exceptions_1.ApplicationAuthorizationError('user-creation', 'create-super-admin', requestingUser.id, 'Only SUPER_ADMIN can create SUPER_ADMIN users');
            }
        }
        catch (error) {
            if (error instanceof application_exceptions_1.ApplicationAuthorizationError) {
                throw error;
            }
            throw new application_exceptions_1.UseCaseExecutionError('CreateUserWithProperExceptions', `Permission validation failed: ${error.message}`, error);
        }
    }
    async validateUserData(request, context) {
        try {
            let email;
            try {
                email = new email_vo_1.Email(request.email.trim());
            }
            catch {
                throw new application_exceptions_1.ApplicationValidationError('email', request.email, 'Invalid email format according to domain rules');
            }
            if (!request.name?.trim() || request.name.trim().length < 2) {
                throw new application_exceptions_1.ApplicationValidationError('name', request.name, 'Name must be at least 2 characters long');
            }
            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                throw new application_exceptions_1.ApplicationValidationError('email', email.value, 'Email address is already registered in the system');
            }
            return {
                email,
                name: request.name.trim(),
                role: request.role,
            };
        }
        catch (error) {
            if (error instanceof application_exceptions_1.ApplicationValidationError) {
                throw error;
            }
            throw new application_exceptions_1.UseCaseExecutionError('CreateUserWithProperExceptions', `Data validation failed: ${error.message}`, error);
        }
    }
    async createUser(data, context) {
        try {
            const user = user_entity_1.User.create(data.email, data.name, data.role);
            return await this.userRepository.save(user);
        }
        catch (error) {
            throw new application_exceptions_1.UseCaseExecutionError('CreateUserWithProperExceptions', `User creation failed during persistence: ${error.message}`, error);
        }
    }
    async sendWelcomeEmailIfRequested(user, shouldSendEmail, context) {
        if (!shouldSendEmail) {
            return false;
        }
        try {
            await this.emailService.sendWelcomeEmail(user.email.value, user.name, JSON.stringify({
                userId: user.id,
                loginUrl: 'https://app.example.com/login',
            }));
            this.logger.info(this.i18n.t('success.email.welcome_sent'), {
                ...context,
                userId: user.id,
                email: user.email.value,
            });
            return true;
        }
        catch (error) {
            throw new application_exceptions_1.ExternalServiceError('EmailService', 'sendWelcomeEmail', error, 1);
        }
    }
}
exports.CreateUserWithProperExceptionsUseCase = CreateUserWithProperExceptionsUseCase;
//# sourceMappingURL=create-user-with-proper-exceptions.use-case.js.map