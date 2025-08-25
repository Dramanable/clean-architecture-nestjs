import { PasswordResetConfirmDto, PasswordResetRequestDto, PasswordResetResponseDto, TokenValidationResponseDto } from '../dtos/password-reset.dto';
export declare class PasswordResetController {
    initiatePasswordReset(request: PasswordResetRequestDto): Promise<PasswordResetResponseDto>;
    validateToken(token: string): Promise<TokenValidationResponseDto>;
    confirmPasswordReset(request: PasswordResetConfirmDto): Promise<PasswordResetResponseDto>;
}
