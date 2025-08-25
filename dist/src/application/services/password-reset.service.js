"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetService = void 0;
const common_1 = require("@nestjs/common");
const password_reset_token_entity_1 = require("../../domain/entities/password-reset-token.entity");
class PasswordResetService {
    userRepository;
    emailService;
    tokenRepository;
    logger = new common_1.Logger(PasswordResetService.name);
    constructor(userRepository, emailService, tokenRepository) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.tokenRepository = tokenRepository;
    }
    async initiatePasswordReset(email, lang = 'en') {
        this.logger.log('Attempting to initiate password reset');
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            this.logger.warn('Password reset failed: user not found');
            return {
                success: true,
                message: 'Password reset email sent successfully',
            };
        }
        await this.tokenRepository.deleteByUserId(user.id);
        this.logger.log('Generating password reset token');
        const resetToken = password_reset_token_entity_1.PasswordResetTokenFactory.create(user.id);
        await this.tokenRepository.save(resetToken);
        this.logger.log('Sending password reset email');
        try {
            await this.emailService.sendPasswordResetEmail(email, resetToken.token);
            this.logger.log('Password reset email sent successfully');
            return {
                success: true,
                message: 'Password reset initiated successfully',
            };
        }
        catch (error) {
            this.logger.error('Password reset failed: email sending failed', error);
            return {
                success: true,
                message: 'Password reset email sent successfully',
            };
        }
    }
    async validateResetToken(token, lang = 'en') {
        const resetToken = await this.tokenRepository.findByToken(token);
        if (!resetToken) {
            return {
                isValid: false,
                error: 'Token not found',
            };
        }
        if (password_reset_token_entity_1.PasswordResetTokenFactory.isExpired(resetToken)) {
            return {
                isValid: false,
                error: 'Token expired',
            };
        }
        return {
            isValid: true,
            userId: resetToken.userId,
        };
    }
    async confirmPasswordReset(token, newPassword, lang = 'en') {
        const validation = await this.validateResetToken(token, lang);
        if (!validation.isValid) {
            return {
                success: false,
                error: 'Invalid or expired token',
            };
        }
        if (!this.isPasswordSecure(newPassword)) {
            return {
                success: false,
                error: 'Password does not meet security requirements',
            };
        }
        const user = await this.userRepository.findById(validation.userId);
        if (!user) {
            return {
                success: false,
                error: 'User not found',
            };
        }
        const updatedUser = user.clearPasswordChangeRequirement();
        await this.userRepository.save(updatedUser);
        await this.tokenRepository.deleteByUserId(user.id);
        return {
            success: true,
            message: 'Password reset successfully',
        };
    }
    async cleanupExpiredTokens() {
        return await this.tokenRepository.deleteExpiredTokens();
    }
    isPasswordSecure(password) {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        return minLength && hasUpperCase && hasLowerCase && hasNumbers;
    }
}
exports.PasswordResetService = PasswordResetService;
//# sourceMappingURL=password-reset.service.js.map