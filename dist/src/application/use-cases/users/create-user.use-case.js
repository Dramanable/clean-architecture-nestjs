"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserUseCase = void 0;
const user_entity_1 = require("../../../domain/entities/user.entity");
const user_exceptions_1 = require("../../../domain/exceptions/user.exceptions");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
const user_role_enum_1 = require("../../../shared/enums/user-role.enum");
class CreateUserUseCase {
    userRepository;
    logger;
    i18n;
    constructor(userRepository, logger, i18n) {
        this.userRepository = userRepository;
        this.logger = logger;
        this.i18n = i18n;
    }
    async execute(request) {
        const startTime = Date.now();
        const requestContext = {
            operation: 'CreateUser',
            requestingUserId: request.requestingUserId,
            targetEmail: request.email,
            targetRole: request.role,
        };
        this.logger.info(this.i18n.t('operations.user.creation_attempt'), requestContext);
        try {
            this.logger.debug(this.i18n.t('operations.user.validation_process'), requestContext);
            const requestingUser = await this.userRepository.findById(request.requestingUserId);
            if (!requestingUser) {
                this.logger.warn(this.i18n.t('warnings.user.not_found'), requestContext);
                throw new user_exceptions_1.UserNotFoundError(request.requestingUserId);
            }
            this.logger.debug(this.i18n.t('operations.permission.check', { operation: 'CreateUser' }), requestContext);
            this.validatePermissions(requestingUser, request.role);
            this.validateInput(request);
            let email;
            try {
                email = new email_vo_1.Email(request.email.trim());
            }
            catch {
                this.logger.warn(this.i18n.t('warnings.email.invalid_format', {
                    email: request.email,
                }), { ...requestContext, email: request.email });
                throw new user_exceptions_1.InvalidEmailFormatError(request.email);
            }
            const existingUser = await this.userRepository.findByEmail(email);
            if (existingUser) {
                this.logger.warn(this.i18n.t('warnings.email.already_exists', {
                    email: email.value,
                }), { ...requestContext, email: email.value });
                throw new user_exceptions_1.EmailAlreadyExistsError(email.value);
            }
            const newUser = new user_entity_1.User(email, request.name.trim(), request.role);
            const savedUser = await this.userRepository.save(newUser);
            const duration = Date.now() - startTime;
            this.logger.info(this.i18n.t('success.user.creation_success', {
                email: savedUser.email.value,
                requestingUser: requestingUser.email.value,
            }), { ...requestContext, userId: savedUser.id, duration });
            this.logger.audit(this.i18n.t('audit.user.created'), request.requestingUserId, {
                targetUserId: savedUser.id,
                targetEmail: savedUser.email.value,
                targetRole: savedUser.role,
            });
            return {
                id: savedUser.id || 'generated-id',
                email: savedUser.email.value,
                name: savedUser.name,
                role: savedUser.role,
                createdAt: savedUser.createdAt || new Date(),
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(this.i18n.t('operations.failed', { operation: 'CreateUser' }), error, { ...requestContext, duration });
            throw error;
        }
    }
    validatePermissions(requestingUser, targetRole) {
        if (!requestingUser.hasPermission(user_role_enum_1.Permission.CREATE_USER)) {
            this.logger.warn(this.i18n.t('warnings.permission.denied'), {
                requestingUserId: requestingUser.id,
                requestingUserRole: requestingUser.role,
                requiredPermission: user_role_enum_1.Permission.CREATE_USER,
            });
            throw new user_exceptions_1.InsufficientPermissionsError(user_role_enum_1.Permission.CREATE_USER, requestingUser.role);
        }
        if (requestingUser.role === user_role_enum_1.UserRole.MANAGER) {
            if (targetRole === user_role_enum_1.UserRole.SUPER_ADMIN) {
                this.logger.warn(this.i18n.t('warnings.role.elevation_attempt', {
                    targetRole: user_role_enum_1.UserRole.SUPER_ADMIN,
                }), { requestingUserId: requestingUser.id, targetRole });
                throw new user_exceptions_1.RoleElevationError(user_role_enum_1.UserRole.MANAGER, user_role_enum_1.UserRole.SUPER_ADMIN);
            }
            if (targetRole === user_role_enum_1.UserRole.MANAGER) {
                this.logger.warn(this.i18n.t('warnings.role.elevation_attempt', {
                    targetRole: user_role_enum_1.UserRole.MANAGER,
                }), { requestingUserId: requestingUser.id, targetRole });
                throw new user_exceptions_1.RoleElevationError(user_role_enum_1.UserRole.MANAGER, user_role_enum_1.UserRole.MANAGER);
            }
        }
    }
    validateInput(request) {
        if (!request.name || request.name.trim().length === 0) {
            this.logger.warn(this.i18n.t('operations.validation.failed', { field: 'name' }), { name: request.name, reason: 'empty' });
            throw new user_exceptions_1.InvalidNameError(request.name, this.i18n.t('errors.name.empty'));
        }
        if (request.name.trim().length > 100) {
            this.logger.warn(this.i18n.t('operations.validation.failed', { field: 'name' }), { name: request.name, reason: 'too_long' });
            throw new user_exceptions_1.InvalidNameError(request.name, this.i18n.t('errors.name.too_long'));
        }
    }
}
exports.CreateUserUseCase = CreateUserUseCase;
//# sourceMappingURL=create-user.use-case.js.map