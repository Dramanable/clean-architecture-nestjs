export declare abstract class DomainException extends Error {
    readonly code: string;
    readonly timestamp: Date;
    constructor(message: string, code: string);
}
export declare class InvalidEmailException extends DomainException {
    constructor(email: string);
}
export declare class InvalidNameException extends DomainException {
    constructor(name: string);
}
export declare class EmptyFieldException extends DomainException {
    constructor(fieldName: string);
}
