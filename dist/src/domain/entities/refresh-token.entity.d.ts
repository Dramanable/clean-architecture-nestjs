export declare class RefreshToken {
    readonly id: string;
    readonly userId: string;
    readonly tokenHash: string;
    readonly deviceId?: string;
    readonly userAgent?: string;
    readonly ipAddress?: string;
    readonly expiresAt: Date;
    readonly createdAt: Date;
    readonly isRevoked: boolean;
    readonly revokedAt?: Date;
    readonly revokedReason?: string;
    constructor(userId: string, token: string, expiresAt: Date, deviceId?: string, userAgent?: string, ipAddress?: string, skipValidation?: boolean);
    revoke(reason: string): RefreshToken;
    verifyToken(plainToken: string): boolean;
    isValid(): boolean;
    isExpired(): boolean;
    getTimeToExpiry(): number;
    matchesDevice(deviceId?: string, userAgent?: string): boolean;
    private withRevocation;
    private validateInputs;
    private validateBasicInputs;
    private hashToken;
    private generateId;
    equals(other: RefreshToken): boolean;
    toString(): string;
    static reconstruct(id: string, userId: string, tokenHash: string, expiresAt: Date, metadata: {
        deviceId?: string;
        userAgent?: string;
        ipAddress?: string;
    }, isRevoked?: boolean, revokedAt?: Date, createdAt?: Date, _updatedAt?: Date): RefreshToken;
}
