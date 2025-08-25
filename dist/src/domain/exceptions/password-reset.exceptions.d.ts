import { DomainException } from './domain.exception';
export declare class UserNotFoundForPasswordResetError extends DomainException {
    constructor(email: string);
}
export declare class InvalidEmailForPasswordResetError extends DomainException {
    constructor(email: string);
}
