import { IEmailService } from '../../application/ports/email.port';
export declare class MockEmailService implements IEmailService {
    private readonly sentEmails;
    sendWelcomeEmail(to: string, userName: string, temporaryPassword: string, loginUrl: string): Promise<void>;
    sendPasswordResetEmail(to: string, userName: string, resetToken: string, resetUrl: string): Promise<void>;
    sendNotificationEmail(to: string, subject: string, htmlContent: string, textContent?: string): Promise<void>;
    getSentEmails(): Array<{
        to: string;
        subject: string;
        body: string;
        timestamp: Date;
    }>;
    getLastEmailTo(email: string): any;
    clearSentEmails(): void;
    getSentEmailsCount(): number;
}
