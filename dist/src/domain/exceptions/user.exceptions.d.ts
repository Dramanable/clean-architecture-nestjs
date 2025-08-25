export declare abstract class DomainException extends Error {
    readonly code: string;
    readonly i18nKey: string;
    readonly context?: Record<string, any>;
    constructor(message: string, code: string, i18nKey: string, context?: Record<string, any>);
}
export declare class UserNotFoundError extends DomainException {
    constructor(userId: string);
}
export declare class EmailAlreadyExistsError extends DomainException {
    constructor(email: string);
}
export declare class InvalidCredentialsError extends DomainException {
    constructor();
}
export declare class InsufficientPermissionsError extends DomainException {
    constructor(permission: string, userRole: string);
}
export declare class InvalidEmailFormatError extends DomainException {
    constructor(email: string);
}
export declare class InvalidNameError extends DomainException {
    constructor(name: string, reason: string);
}
export declare class RoleElevationError extends DomainException {
    constructor(fromRole: string, toRole: string);
}
export declare class SelfDeletionError extends DomainException {
    constructor(userId: string);
}
