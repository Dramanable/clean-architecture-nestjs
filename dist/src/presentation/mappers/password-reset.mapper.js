"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetMapper = void 0;
class PasswordResetMapper {
    static toResponseDto(success, message) {
        return {
            success,
            message,
            timestamp: new Date().toISOString(),
        };
    }
    static toTokenValidationDto(isValid, error) {
        return {
            isValid,
            error,
            timestamp: new Date().toISOString(),
        };
    }
    static extractEmailFromRequest(dto) {
        return dto.email;
    }
    static extractConfirmationData(dto) {
        return {
            token: dto.token,
            newPassword: dto.newPassword,
        };
    }
}
exports.PasswordResetMapper = PasswordResetMapper;
//# sourceMappingURL=password-reset.mapper.js.map