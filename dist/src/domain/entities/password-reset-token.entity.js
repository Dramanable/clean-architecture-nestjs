"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetTokenFactory = void 0;
class PasswordResetTokenFactory {
    static TOKEN_VALIDITY_HOURS = 1;
    static create(userId) {
        const token = this.generateSecureToken();
        const expiresAt = new Date(Date.now() + this.TOKEN_VALIDITY_HOURS * 60 * 60 * 1000);
        return {
            token,
            userId,
            expiresAt,
            createdAt: new Date(),
        };
    }
    static isExpired(token) {
        return new Date() > token.expiresAt;
    }
    static generateSecureToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
exports.PasswordResetTokenFactory = PasswordResetTokenFactory;
//# sourceMappingURL=password-reset-token.entity.js.map