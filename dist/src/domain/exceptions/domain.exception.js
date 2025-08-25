"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyFieldException = exports.InvalidNameException = exports.InvalidEmailException = exports.DomainException = void 0;
class DomainException extends Error {
    code;
    timestamp;
    constructor(message, code) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.timestamp = new Date();
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.DomainException = DomainException;
class InvalidEmailException extends DomainException {
    constructor(email) {
        super(`Invalid email format: ${email}`, 'INVALID_EMAIL');
    }
}
exports.InvalidEmailException = InvalidEmailException;
class InvalidNameException extends DomainException {
    constructor(name) {
        super(`Invalid name: ${name}`, 'INVALID_NAME');
    }
}
exports.InvalidNameException = InvalidNameException;
class EmptyFieldException extends DomainException {
    constructor(fieldName) {
        super(`${fieldName} cannot be empty`, 'EMPTY_FIELD');
    }
}
exports.EmptyFieldException = EmptyFieldException;
//# sourceMappingURL=domain.exception.js.map