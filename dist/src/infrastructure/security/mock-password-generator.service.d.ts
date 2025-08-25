import { IPasswordGenerator } from '../../application/ports/password-generator.port';
export declare class MockPasswordGenerator implements IPasswordGenerator {
    private readonly generatedPasswords;
    generateTemporaryPassword(): Promise<string>;
    generateResetToken(): Promise<string>;
    validatePasswordStrength(password: string): Promise<{
        isValid: boolean;
        score: number;
        feedback: string[];
    }>;
    hashPassword(password: string): Promise<string>;
    validatePassword(password: string, hash: string): Promise<boolean>;
    getGeneratedPasswordsCount(): number;
    getLastGeneratedPassword(): string | null;
    clearGeneratedPasswords(): void;
    getPasswordHistory(): Array<{
        password: string;
        timestamp: Date;
        type: 'temporary' | 'reset';
    }>;
}
