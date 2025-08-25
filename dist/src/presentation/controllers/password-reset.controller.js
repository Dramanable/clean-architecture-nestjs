"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_dto_1 = require("../dtos/common.dto");
const password_reset_dto_1 = require("../dtos/password-reset.dto");
const password_reset_mapper_1 = require("../mappers/password-reset.mapper");
let PasswordResetController = class PasswordResetController {
    initiatePasswordReset(request) {
        return Promise.resolve(password_reset_mapper_1.PasswordResetMapper.toResponseDto(true, 'Password reset email sent successfully'));
    }
    validateToken(token) {
        return Promise.resolve({
            isValid: true,
            token: token,
            message: 'Token is valid',
            timestamp: new Date().toISOString(),
        });
    }
    confirmPasswordReset(request) {
        return Promise.resolve(password_reset_mapper_1.PasswordResetMapper.toResponseDto(true, `Password reset completed successfully for token: ${request.token}`));
    }
};
exports.PasswordResetController = PasswordResetController;
__decorate([
    (0, common_1.Post)('initiate'),
    (0, swagger_1.ApiOperation)({
        summary: 'Initiate password reset',
        description: 'Sends a password reset email to the user if the email exists',
    }),
    (0, swagger_1.ApiBody)({
        type: password_reset_dto_1.PasswordResetRequestDto,
        description: 'Email address for password reset',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Password reset email sent (always returns success for security)',
        type: password_reset_dto_1.PasswordResetResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid email format',
        type: common_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.PasswordResetRequestDto]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "initiatePasswordReset", null);
__decorate([
    (0, common_1.Get)('validate/:token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Validate password reset token',
        description: 'Checks if a password reset token is valid and not expired',
    }),
    (0, swagger_1.ApiParam)({
        name: 'token',
        description: 'Password reset token to validate',
        type: 'string',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Token validation result',
        type: password_reset_dto_1.TokenValidationResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Token not found or expired',
        type: common_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "validateToken", null);
__decorate([
    (0, common_1.Post)('confirm'),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm password reset',
        description: 'Sets new password using a valid reset token',
    }),
    (0, swagger_1.ApiBody)({
        type: password_reset_dto_1.PasswordResetConfirmDto,
        description: 'Token and new password for confirmation',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Password reset successfully',
        type: password_reset_dto_1.PasswordResetResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid token or weak password',
        type: common_dto_1.ApiErrorResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.GONE,
        description: 'Token expired',
        type: common_dto_1.ApiErrorResponseDto,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.PasswordResetConfirmDto]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "confirmPasswordReset", null);
exports.PasswordResetController = PasswordResetController = __decorate([
    (0, swagger_1.ApiTags)('password-reset'),
    (0, common_1.Controller)('password-reset')
], PasswordResetController);
//# sourceMappingURL=password-reset.controller.js.map