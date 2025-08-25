import { PasswordResetToken } from '../entities/password-reset-token.entity';
export interface PasswordResetTokenRepository {
    save(token: PasswordResetToken): Promise<void>;
    findByToken(token: string): Promise<PasswordResetToken | null>;
    deleteByUserId(userId: string): Promise<void>;
    deleteExpiredTokens(): Promise<number>;
}
