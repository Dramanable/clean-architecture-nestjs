"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEmailService = void 0;
const common_1 = require("@nestjs/common");
let MockEmailService = class MockEmailService {
    sentEmails = [];
    async sendWelcomeEmail(to, userName, temporaryPassword, loginUrl) {
        const emailContent = {
            to,
            subject: `Bienvenue ${userName} !`,
            body: `
        Bonjour ${userName},
        
        Votre compte a été créé avec succès !
        
        Votre mot de passe temporaire : ${temporaryPassword}
        Lien de connexion : ${loginUrl}
        
        Veuillez changer votre mot de passe lors de votre première connexion.
        
        Cordialement,
        L'équipe
      `,
            timestamp: new Date(),
        };
        this.sentEmails.push(emailContent);
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log(`📧 EMAIL SENT: ${emailContent.subject} to ${to}`);
    }
    async sendPasswordResetEmail(to, userName, resetToken, resetUrl) {
        const emailContent = {
            to,
            subject: 'Réinitialisation de mot de passe',
            body: `
        Bonjour ${userName},
        
        Une demande de réinitialisation de mot de passe a été effectuée.
        
        Token de réinitialisation : ${resetToken}
        Lien de réinitialisation : ${resetUrl}
        
        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        
        Cordialement,
        L'équipe
      `,
            timestamp: new Date(),
        };
        this.sentEmails.push(emailContent);
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log(`🔑 PASSWORD RESET EMAIL SENT to ${to}`);
    }
    async sendNotificationEmail(to, subject, htmlContent, textContent) {
        const emailContent = {
            to,
            subject,
            body: htmlContent || textContent || 'Notification email',
            timestamp: new Date(),
        };
        this.sentEmails.push(emailContent);
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log(`📧 NOTIFICATION EMAIL SENT to ${to}: ${subject}`);
    }
    getSentEmails() {
        return [...this.sentEmails];
    }
    getLastEmailTo(email) {
        return this.sentEmails
            .filter((e) => e.to === email)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    }
    clearSentEmails() {
        this.sentEmails.length = 0;
    }
    getSentEmailsCount() {
        return this.sentEmails.length;
    }
};
exports.MockEmailService = MockEmailService;
exports.MockEmailService = MockEmailService = __decorate([
    (0, common_1.Injectable)()
], MockEmailService);
//# sourceMappingURL=mock-email.service.js.map