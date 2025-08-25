export declare class Email {
    readonly value: string;
    constructor(email: string);
    private validateNotEmpty;
    private validateLength;
    private validateFormat;
    equals(other: Email): boolean;
    toString(): string;
    getDomain(): string;
    getLocalPart(): string;
}
