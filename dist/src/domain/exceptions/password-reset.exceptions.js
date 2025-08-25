"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidEmailForPasswordResetError = exports.UserNotFoundForPasswordResetError = void 0;
const domain_exception_1 = require("./domain.exception");
class UserNotFoundForPasswordResetError extends domain_exception_1.DomainException {
    constructor(email) {
        super(`User not found for password reset: ${email}`, 'DOMAIN.PASSWORD_RESET.USER_NOT_FOUND');
    }
}
exports.UserNotFoundForPasswordResetError = UserNotFoundForPasswordResetError;
class InvalidEmailForPasswordResetError extends domain_exception_1.DomainException {
    constructor(email) {
        super(`Invalid email for password reset: ${email}`, 'DOMAIN.PASSWORD_RESET.INVALID_EMAIL');
    }
}
exports.InvalidEmailForPasswordResetError = InvalidEmailForPasswordResetError;
//# sourceMappingURL=password-reset.exceptions.js.map