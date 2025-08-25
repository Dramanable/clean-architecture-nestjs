"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserUseCase = void 0;
const user_entity_1 = require("../../../domain/entities/user.entity");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
const user_role_enum_1 = require("../../../shared/enums/user-role.enum");
const user_exceptions_1 = require("../../../domain/exceptions/user.exceptions");
class UpdateUserUseCase {
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
            operation: 'UpdateUser',
            requestingUserId: request.requestingUserId,
            targetUserId: request.userId,
            updates: {
                email: request.email,
                name: request.name,
                role: request.role,
            },
        };
        this.logger.info(this.i18n.t('operations.user.update_attempt', { userId: request.userId }), requestContext);
        try {
            const requestingUser = await this.userRepository.findById(request.requestingUserId);
            if (!requestingUser) {
                this.logger.warn(this.i18n.t('warnings.user.not_found'), requestContext);
                throw new user_exceptions_1.UserNotFoundError(request.requestingUserId);
            }
            const targetUser = await this.userRepository.findById(request.userId);
            if (!targetUser) {
                this.logger.warn(this.i18n.t('warnings.user.not_found'), { ...requestContext, targetUserId: request.userId });
                throw new user_exceptions_1.UserNotFoundError(request.userId);
            }
            this.validatePermissions(requestingUser, targetUser, request);
            await this.validateInput(request, targetUser);
            const updateData = {};
            if (request.name !== undefined) {
                updateData.name = request.name.trim();
            }
            if (request.email !== undefined) {
                updateData.email = request.email.trim().toLowerCase();
            }
            if (request.role !== undefined) {
                updateData.role = request.role;
            }
            const updatedUser = new user_entity_1.User(request.email !== undefined ? new email_vo_1.Email(request.email.trim()) : targetUser.email, request.name !== undefined ? request.name.trim() : targetUser.name, request.role !== undefined ? request.role : targetUser.role);
            if (targetUser.id) {
                updatedUser.id = targetUser.id;
            }
            const savedUser = await this.userRepository.update(updatedUser);
            const duration = Date.now() - startTime;
            this.logger.info(this.i18n.t('success.user.update_success', {
                email: savedUser.email.value,
                requestingUser: requestingUser.email.value,
            }), { ...requestContext, duration });
            this.logger.audit(this.i18n.t('audit.user.updated'), request.requestingUserId, {
                targetUserId: savedUser.id,
                targetEmail: savedUser.email.value,
                changes: updateData,
            });
            return {
                id: savedUser.id || request.userId,
                email: savedUser.email.value,
                name: savedUser.name,
                role: savedUser.role,
                updatedAt: new Date(),
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger.error(this.i18n.t('operations.failed', { operation: 'UpdateUser' }), error, { ...requestContext, duration });
            throw error;
        }
    }
    validatePermissions(requestingUser, targetUser, request) {
        const isSelfUpdate = requestingUser.id === targetUser.id;
        if (isSelfUpdate) {
            if (request.role !== undefined) {
                this.logger.warn(this.i18n.t('warnings.permission.denied'), {
                    reason: 'self_role_change_forbidden',
                    requestingUserId: requestingUser.id,
                });
                throw new user_exceptions_1.InsufficientPermissionsError('CHANGE_OWN_ROLE', requestingUser.role);
            }
            return;
        }
        if (!requestingUser.hasPermission(user_role_enum_1.Permission.UPDATE_USER) ||
            requestingUser.role === user_role_enum_1.UserRole.USER) {
            this.logger.warn(this.i18n.t('warnings.permission.denied'), {
                requestingUserId: requestingUser.id,
                requestingUserRole: requestingUser.role,
                requiredPermission: user_role_enum_1.Permission.UPDATE_USER,
                reason: 'regular_user_cannot_update_others',
            });
            throw new user_exceptions_1.InsufficientPermissionsError(user_role_enum_1.Permission.UPDATE_USER, requestingUser.role);
        }
        if (request.role !== undefined) {
            this.validateRoleChange(requestingUser, targetUser, request.role);
        }
        if (requestingUser.role === user_role_enum_1.UserRole.MANAGER) {
            if (targetUser.role === user_role_enum_1.UserRole.MANAGER ||
                targetUser.role === user_role_enum_1.UserRole.SUPER_ADMIN) {
                this.logger.warn(this.i18n.t('warnings.permission.denied'), {
                    reason: 'manager_cannot_modify_manager_or_admin',
                    requestingUserId: requestingUser.id,
                    targetUserRole: targetUser.role,
                });
                throw new user_exceptions_1.InsufficientPermissionsError('MODIFY_MANAGER_OR_ADMIN', requestingUser.role);
            }
        }
    }
    validateRoleChange(requestingUser, targetUser, newRole) {
        if (requestingUser.role !== user_role_enum_1.UserRole.SUPER_ADMIN) {
            if (requestingUser.role === user_role_enum_1.UserRole.MANAGER) {
                if (newRole === user_role_enum_1.UserRole.MANAGER || newRole === user_role_enum_1.UserRole.SUPER_ADMIN) {
                    this.logger.warn(this.i18n.t('warnings.role.elevation_attempt', { targetRole: newRole }), {
                        requestingUserId: requestingUser.id,
                        targetUserId: targetUser.id,
                        currentRole: targetUser.role,
                        newRole,
                    });
                    throw new user_exceptions_1.RoleElevationError(requestingUser.role, newRole);
                }
            }
        }
    }
    async validateInput(request, targetUser) {
        if (request.name !== undefined) {
            if (!request.name || request.name.trim().length === 0) {
                this.logger.warn(this.i18n.t('operations.validation.failed', { field: 'name' }), { name: request.name, reason: 'empty' });
                throw new user_exceptions_1.InvalidNameError(request.name, this.i18n.t('errors.name.empty'));
            }
            if (request.name.trim().length > 100) {
                this.logger.warn(this.i18n.t('operations.validation.failed', { field: 'name' }), { name: request.name, reason: 'too_long' });
                throw new user_exceptions_1.InvalidNameError(request.name, this.i18n.t('errors.name.too_long'));
            }
        }
        if (request.email !== undefined) {
            let email;
            try {
                email = new email_vo_1.Email(request.email.trim());
            }
            catch {
                this.logger.warn(this.i18n.t('warnings.email.invalid_format', { email: request.email }), { email: request.email });
                throw new user_exceptions_1.InvalidEmailFormatError(request.email);
            }
            if (email.value !== targetUser.email.value) {
                const existingUser = await this.userRepository.findByEmail(email);
                if (existingUser) {
                    this.logger.warn(this.i18n.t('warnings.email.already_exists', { email: email.value }), { email: email.value, targetUserId: request.userId });
                    throw new user_exceptions_1.EmailAlreadyExistsError(email.value);
                }
            }
        }
    }
}
exports.UpdateUserUseCase = UpdateUserUseCase;
//# sourceMappingURL=update-user.use-case.js.map