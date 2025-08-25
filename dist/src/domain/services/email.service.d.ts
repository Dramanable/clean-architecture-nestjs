import { Email } from '../value-objects/email.vo';
export interface EmailService {
    sendPasswordResetEmail(email: Email, resetToken: string): Promise<void>;
    sendWelcomeEmail(email: string, userName: string, welcomeData: string): Promise<void>;
}
