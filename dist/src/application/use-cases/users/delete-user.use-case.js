"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserUseCase = void 0;
const user_role_enum_1 = require("../../../shared/enums/user-role.enum");
const user_exceptions_1 = require("../../../domain/exceptions/user.exceptions");
class DeleteUserUseCase {
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
            operation: 'DeleteUser',
            requestingUserId: request.requestingUserId,
            targetUserId: request.userId,
        };
        this.logger.info(this.i18n.t('operations.user.deletion_attempt', { userId: request.userId }), requestContext);
        try {
            this.logger.debug(this.i18n.t('info.user.validation_start'), requestContext);
            const requestingUser = await this.userRepository.findById(request.requestingUserId);
            if (!requestingUser) {
                this.logger.warn(this.i18n.t('warnings.user.not_found'), requestContext);
                throw new user_exceptions_1.UserNotFoundError(request.requestingUserId);
            }
            const targetUser = await this.userRepository.findById(request.userId);
            if (!targetUser) {
                this.logger.warn(this.i18n.t('warnings.user.target_not_found', { userId: request.userId }), requestContext);
                throw new user_exceptions_1.UserNotFoundError(request.userId);
            }
            this.logger.debug(this.i18n.t('info.permission.check', { operation: 'DeleteUser' }), requestContext);
            this.validatePermissions(requestingUser, targetUser);
            await this.userRepository.delete(request.userId);
            const duration = Date.now() - startTime;
            this.logger.info(this.i18n.t('success.user.deletion_success', {
                email: targetUser.email.value,
                requestingUser: requestingUser.email.value,
            }), { ...requestContext, duration });
            this.logger.audit(this.i18n.t('audit.user.deleted'), request.requestingUserId, {
                targetUserId: targetUser.id,
                targetEmail: targetUser.email.value,
                targetRole: targetUser.role,
            });
            return {
                success: true,
                deletedUserId: request.userId,
                deletedAt: new Date(),
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(this.i18n.t('operations.failed', { operation: 'DeleteUser' }), error, { ...requestContext, duration });
            throw error;
        }
    }
    validatePermissions(requestingUser, targetUser) {
        if (requestingUser.id === targetUser.id) {
            this.logger.warn(this.i18n.t('warnings.user.self_deletion_forbidden'), {
                requestingUserId: requestingUser.id,
            });
            throw new user_exceptions_1.SelfDeletionError(requestingUser.id);
        }
        if (!requestingUser.hasPermission(user_role_enum_1.Permission.DELETE_USER)) {
            this.logger.warn(this.i18n.t('warnings.permission.denied'), {
                requestingUserId: requestingUser.id,
                requestingUserRole: requestingUser.role,
                requiredPermission: user_role_enum_1.Permission.DELETE_USER,
            });
            throw new user_exceptions_1.InsufficientPermissionsError(user_role_enum_1.Permission.DELETE_USER, requestingUser.role);
        }
        if (requestingUser.role === user_role_enum_1.UserRole.MANAGER) {
            if (targetUser.role === user_role_enum_1.UserRole.MANAGER ||
                targetUser.role === user_role_enum_1.UserRole.SUPER_ADMIN) {
                this.logger.warn(this.i18n.t('warnings.permission.denied'), {
                    reason: 'manager_cannot_delete_manager_or_admin',
                    requestingUserId: requestingUser.id,
                    targetUserRole: targetUser.role,
                });
                throw new user_exceptions_1.InsufficientPermissionsError('DELETE_MANAGER_OR_ADMIN', requestingUser.role);
            }
        }
    }
}
exports.DeleteUserUseCase = DeleteUserUseCase;
//# sourceMappingURL=delete-user.use-case.js.map