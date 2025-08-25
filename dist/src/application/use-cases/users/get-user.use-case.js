"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserUseCase = void 0;
const user_exceptions_1 = require("../../../domain/exceptions/user.exceptions");
const user_role_enum_1 = require("../../../shared/enums/user-role.enum");
class GetUserUseCase {
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
            operation: 'GetUser',
            requestingUserId: request.requestingUserId,
            targetUserId: request.userId,
        };
        this.logger.info(this.i18n.t('operations.user.retrieval_attempt', {
            userId: request.userId,
        }), requestContext);
        try {
            this.logger.debug(this.i18n.t('operations.user.validation_process'), requestContext);
            const requestingUser = await this.userRepository.findById(request.requestingUserId);
            if (!requestingUser) {
                this.logger.warn(this.i18n.t('warnings.user.not_found'), requestContext);
                throw new user_exceptions_1.UserNotFoundError(request.requestingUserId);
            }
            this.logger.debug(this.i18n.t('operations.user.target_lookup', {
                userId: request.userId,
            }), requestContext);
            const targetUser = await this.userRepository.findById(request.userId);
            if (!targetUser) {
                this.logger.warn(this.i18n.t('warnings.user.target_not_found', {
                    userId: request.userId,
                }), requestContext);
                throw new user_exceptions_1.UserNotFoundError(request.userId);
            }
            this.logger.debug(this.i18n.t('operations.permission.check', { operation: 'GetUser' }), requestContext);
            this.validateViewPermissions(requestingUser, targetUser);
            const duration = Date.now() - startTime;
            this.logger.info(this.i18n.t('success.user.retrieval_success', {
                email: targetUser.email.value,
                requestingUser: requestingUser.email.value,
            }), { ...requestContext, duration });
            this.logger.audit(this.i18n.t('audit.user.accessed'), request.requestingUserId, {
                targetUserId: targetUser.id,
                targetEmail: targetUser.email.value,
                targetRole: targetUser.role,
            });
            return {
                id: targetUser.id || 'generated-id',
                email: targetUser.email.value,
                name: targetUser.name,
                role: targetUser.role,
                passwordChangeRequired: targetUser.passwordChangeRequired,
                createdAt: targetUser.createdAt || new Date(),
                updatedAt: targetUser.updatedAt,
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(this.i18n.t('operations.failed', { operation: 'GetUser' }), error, { ...requestContext, duration });
            throw error;
        }
    }
    validateViewPermissions(requestingUser, targetUser) {
        if (requestingUser.id === targetUser.id) {
            return;
        }
        if (requestingUser.role === user_role_enum_1.UserRole.USER) {
            this.logger.warn(this.i18n.t('warnings.permission.denied'), {
                requestingUserId: requestingUser.id,
                requestingUserRole: requestingUser.role,
                requiredPermission: user_role_enum_1.Permission.VIEW_USER,
            });
            throw new user_exceptions_1.InsufficientPermissionsError(user_role_enum_1.Permission.VIEW_USER, requestingUser.role);
        }
        if (!requestingUser.hasPermission(user_role_enum_1.Permission.VIEW_USER)) {
            this.logger.warn(this.i18n.t('warnings.permission.denied'), {
                requestingUserId: requestingUser.id,
                requestingUserRole: requestingUser.role,
                requiredPermission: user_role_enum_1.Permission.VIEW_USER,
            });
            throw new user_exceptions_1.InsufficientPermissionsError(user_role_enum_1.Permission.VIEW_USER, requestingUser.role);
        }
        if (requestingUser.role === user_role_enum_1.UserRole.MANAGER) {
            if (targetUser.role === user_role_enum_1.UserRole.SUPER_ADMIN) {
                this.logger.warn(this.i18n.t('warnings.permission.admin_access_denied'), {
                    requestingUserId: requestingUser.id,
                    targetUserId: targetUser.id,
                    targetRole: targetUser.role,
                });
                throw new user_exceptions_1.InsufficientPermissionsError(user_role_enum_1.Permission.VIEW_USER, requestingUser.role);
            }
        }
    }
}
exports.GetUserUseCase = GetUserUseCase;
//# sourceMappingURL=get-user.use-case.js.map