"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfDeletionError = exports.RoleElevationError = exports.InvalidNameError = exports.InvalidEmailFormatError = exports.InsufficientPermissionsError = exports.InvalidCredentialsError = exports.EmailAlreadyExistsError = exports.UserNotFoundError = exports.DomainException = void 0;
class DomainException extends Error {
    code;
    i18nKey;
    context;
    constructor(message, code, i18nKey, context) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.i18nKey = i18nKey;
        this.context = context;
    }
}
exports.DomainException = DomainException;
class UserNotFoundError extends DomainException {
    constructor(userId) {
        super(`User with ID ${userId} not found`, 'USER_NOT_FOUND', 'errors.user.not_found', { userId });
    }
}
exports.UserNotFoundError = UserNotFoundError;
class EmailAlreadyExistsError extends DomainException {
    constructor(email) {
        super(`Email ${email} already exists`, 'EMAIL_ALREADY_EXISTS', 'errors.user.email_already_exists', { email });
    }
}
exports.EmailAlreadyExistsError = EmailAlreadyExistsError;
class InvalidCredentialsError extends DomainException {
    constructor() {
        super('Invalid email or password', 'INVALID_CREDENTIALS', 'errors.auth.invalid_credentials');
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
class InsufficientPermissionsError extends DomainException {
    constructor(permission, userRole) {
        super(`Insufficient permissions: ${permission} required for role ${userRole}`, 'INSUFFICIENT_PERMISSIONS', 'errors.auth.insufficient_permissions', { permission, userRole });
    }
}
exports.InsufficientPermissionsError = InsufficientPermissionsError;
class InvalidEmailFormatError extends DomainException {
    constructor(email) {
        super(`Invalid email format: ${email}`, 'INVALID_EMAIL_FORMAT', 'errors.validation.invalid_email', { email });
    }
}
exports.InvalidEmailFormatError = InvalidEmailFormatError;
class InvalidNameError extends DomainException {
    constructor(name, reason) {
        super(`Invalid name: ${reason}`, 'INVALID_NAME', 'errors.validation.invalid_name', { name, reason });
    }
}
exports.InvalidNameError = InvalidNameError;
class RoleElevationError extends DomainException {
    constructor(fromRole, toRole) {
        super(`Cannot elevate from ${fromRole} to ${toRole}`, 'ROLE_ELEVATION_FORBIDDEN', 'errors.auth.role_elevation_forbidden', { fromRole, toRole });
    }
}
exports.RoleElevationError = RoleElevationError;
class SelfDeletionError extends DomainException {
    constructor(userId) {
        super(`User cannot delete themselves`, 'SELF_DELETION_FORBIDDEN', 'errors.user.self_deletion_forbidden', { userId });
    }
}
exports.SelfDeletionError = SelfDeletionError;
//# sourceMappingURL=user.exceptions.js.map