"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
class Email {
    value;
    constructor(email) {
        this.validateNotEmpty(email);
        this.validateLength(email);
        this.validateFormat(email);
        this.value = email.trim().toLowerCase();
    }
    validateNotEmpty(email) {
        if (!email || email.trim().length === 0) {
            throw new Error('Email cannot be empty');
        }
    }
    validateLength(email) {
        if (email.length > 254) {
            throw new Error('Email too long');
        }
    }
    validateFormat(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            throw new Error('Invalid email format');
        }
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
    getDomain() {
        return this.value.split('@')[1];
    }
    getLocalPart() {
        return this.value.split('@')[0];
    }
}
exports.Email = Email;
//# sourceMappingURL=email.vo.js.map