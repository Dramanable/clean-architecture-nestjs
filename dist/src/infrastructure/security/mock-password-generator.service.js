"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPasswordGenerator = void 0;
const common_1 = require("@nestjs/common");
let MockPasswordGenerator = class MockPasswordGenerator {
    generatedPasswords = [];
    async generateTemporaryPassword() {
        const adjectives = ['Quick', 'Brave', 'Calm', 'Smart', 'Bold'];
        const nouns = ['Lion', 'Eagle', 'Tiger', 'Wolf', 'Bear'];
        const numbers = Math.floor(Math.random() * 999) + 100;
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const temporaryPassword = `${adjective}${noun}${numbers}!`;
        this.generatedPasswords.push({
            password: temporaryPassword,
            timestamp: new Date(),
            type: 'temporary',
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        console.log(`🔐 TEMPORARY PASSWORD GENERATED: ${temporaryPassword}`);
        return temporaryPassword;
    }
    async generateResetToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.generatedPasswords.push({
            password: token,
            timestamp: new Date(),
            type: 'reset',
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        console.log(`🔑 RESET TOKEN GENERATED: ${token.substring(0, 8)}...`);
        return token;
    }
    async validatePasswordStrength(password) {
        const feedback = [];
        let score = 0;
        if (password.length >= 8) {
            score += 20;
        }
        else {
            feedback.push('Password should be at least 8 characters long');
        }
        if (/[A-Z]/.test(password)) {
            score += 20;
        }
        else {
            feedback.push('Password should contain uppercase letters');
        }
        if (/[a-z]/.test(password)) {
            score += 20;
        }
        else {
            feedback.push('Password should contain lowercase letters');
        }
        if (/\d/.test(password)) {
            score += 20;
        }
        else {
            feedback.push('Password should contain numbers');
        }
        if (/[^A-Za-z0-9]/.test(password)) {
            score += 20;
        }
        else {
            feedback.push('Password should contain special characters');
        }
        const isValid = score >= 60;
        await new Promise((resolve) => setTimeout(resolve, 30));
        console.log(`🔍 PASSWORD STRENGTH VALIDATION: ${password} -> Score: ${score}/100, Valid: ${isValid}`);
        return {
            isValid,
            score,
            feedback,
        };
    }
    async hashPassword(password) {
        const mockHash = `$2b$12$${Buffer.from(password).toString('base64').substring(0, 22)}mockHashSuffix`;
        await new Promise((resolve) => setTimeout(resolve, 30));
        return mockHash;
    }
    async validatePassword(password, hash) {
        const expectedHash = await this.hashPassword(password);
        return hash === expectedHash;
    }
    getGeneratedPasswordsCount() {
        return this.generatedPasswords.length;
    }
    getLastGeneratedPassword() {
        const last = this.generatedPasswords[this.generatedPasswords.length - 1];
        return last ? last.password : null;
    }
    clearGeneratedPasswords() {
        this.generatedPasswords.length = 0;
    }
    getPasswordHistory() {
        return [...this.generatedPasswords];
    }
};
exports.MockPasswordGenerator = MockPasswordGenerator;
exports.MockPasswordGenerator = MockPasswordGenerator = __decorate([
    (0, common_1.Injectable)()
], MockPasswordGenerator);
//# sourceMappingURL=mock-password-generator.service.js.map