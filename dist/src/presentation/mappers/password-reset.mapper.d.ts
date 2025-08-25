import { PasswordResetConfirmDto, PasswordResetRequestDto, PasswordResetResponseDto, TokenValidationResponseDto } from '../dtos/password-reset.dto';
export declare class PasswordResetMapper {
    static toResponseDto(success: boolean, message: string): PasswordResetResponseDto;
    static toTokenValidationDto(isValid: boolean, error?: string): TokenValidationResponseDto;
    static extractEmailFromRequest(dto: PasswordResetRequestDto): string;
    static extractConfirmationData(dto: PasswordResetConfirmDto): {
        token: string;
        newPassword: string;
    };
}
