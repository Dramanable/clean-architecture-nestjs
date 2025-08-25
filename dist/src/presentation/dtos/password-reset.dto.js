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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenValidationResponseDto = exports.PasswordResetResponseDto = exports.PasswordResetConfirmDto = exports.PasswordResetRequestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class PasswordResetRequestDto {
    email;
}
exports.PasswordResetRequestDto = PasswordResetRequestDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address of the user requesting password reset',
        example: 'john.doe@example.com',
        format: 'email',
    }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.toLowerCase().trim()),
    __metadata("design:type", String)
], PasswordResetRequestDto.prototype, "email", void 0);
class PasswordResetConfirmDto {
    token;
    newPassword;
}
exports.PasswordResetConfirmDto = PasswordResetConfirmDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Password reset token received via email',
        example: 'abcd1234-5678-9012-3456-789012345678',
    }),
    (0, class_validator_1.IsString)({ message: 'Token must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token is required' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], PasswordResetConfirmDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New password for the user',
        example: 'NewSecurePassword123!',
        minLength: 8,
    }),
    (0, class_validator_1.IsString)({ message: 'Password must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Password is required' }),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters long' }),
    __metadata("design:type", String)
], PasswordResetConfirmDto.prototype, "newPassword", void 0);
class PasswordResetResponseDto {
    success;
    message;
    timestamp;
}
exports.PasswordResetResponseDto = PasswordResetResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the operation was successful',
        example: true,
    }),
    __metadata("design:type", Boolean)
], PasswordResetResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success or error message',
        example: 'Password reset email sent successfully',
    }),
    __metadata("design:type", String)
], PasswordResetResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp of the operation',
        example: '2024-01-15T10:00:00.000Z',
        format: 'date-time',
    }),
    __metadata("design:type", String)
], PasswordResetResponseDto.prototype, "timestamp", void 0);
class TokenValidationResponseDto {
    isValid;
    error;
    timestamp;
}
exports.TokenValidationResponseDto = TokenValidationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the token is valid',
        example: true,
    }),
    __metadata("design:type", Boolean)
], TokenValidationResponseDto.prototype, "isValid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Error message if token is invalid',
        example: 'Token expired',
        required: false,
    }),
    __metadata("design:type", String)
], TokenValidationResponseDto.prototype, "error", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Timestamp of the validation',
        example: '2024-01-15T10:00:00.000Z',
        format: 'date-time',
    }),
    __metadata("design:type", String)
], TokenValidationResponseDto.prototype, "timestamp", void 0);
//# sourceMappingURL=password-reset.dto.js.map