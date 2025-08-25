export declare class PasswordResetRequestDto {
    email: string;
}
export declare class PasswordResetConfirmDto {
    token: string;
    newPassword: string;
}
export declare class PasswordResetResponseDto {
    success: boolean;
    message: string;
    timestamp: string;
}
export declare class TokenValidationResponseDto {
    isValid: boolean;
    error?: string;
    timestamp: string;
}
