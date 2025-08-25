import { PasswordResetTokenRepository } from '../../domain/repositories/password-reset-token.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { EmailService } from '../../domain/services/email.service';
import { Email } from '../../domain/value-objects/email.vo';
export interface PasswordResetResult {
    success: boolean;
    message?: string;
    error?: string;
}
export interface TokenValidationResult {
    isValid: boolean;
    userId?: string;
    error?: string;
}
export declare class PasswordResetService {
    private readonly userRepository;
    private readonly emailService;
    private readonly tokenRepository;
    private readonly logger;
    constructor(userRepository: UserRepository, emailService: EmailService, tokenRepository: PasswordResetTokenRepository);
    initiatePasswordReset(email: Email, lang?: string): Promise<PasswordResetResult>;
    validateResetToken(token: string, lang?: string): Promise<TokenValidationResult>;
    confirmPasswordReset(token: string, newPassword: string, lang?: string): Promise<PasswordResetResult>;
    cleanupExpiredTokens(): Promise<number>;
    private isPasswordSecure;
}
