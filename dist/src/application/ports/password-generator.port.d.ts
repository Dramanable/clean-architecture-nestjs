export interface IPasswordGenerator {
    generateTemporaryPassword(length?: number, includeSpecialChars?: boolean): Promise<string>;
    generateResetToken(length?: number): Promise<string>;
    validatePasswordStrength(password: string): Promise<{
        isValid: boolean;
        score: number;
        feedback: string[];
    }>;
}
