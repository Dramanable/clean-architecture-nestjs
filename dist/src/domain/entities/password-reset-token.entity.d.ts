export interface PasswordResetToken {
    readonly token: string;
    readonly userId: string;
    readonly expiresAt: Date;
    readonly createdAt: Date;
}
export declare class PasswordResetTokenFactory {
    private static readonly TOKEN_VALIDITY_HOURS;
    static create(userId: string): PasswordResetToken;
    static isExpired(token: PasswordResetToken): boolean;
    private static generateSecureToken;
}
