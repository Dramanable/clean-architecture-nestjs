export interface IEmailService {
    sendWelcomeEmail(to: string, userName: string, temporaryPassword: string, loginUrl?: string): Promise<void>;
    sendPasswordResetEmail(to: string, userName: string, resetToken: string, resetUrl: string): Promise<void>;
    sendNotificationEmail(to: string, subject: string, htmlContent: string, textContent?: string): Promise<void>;
}
