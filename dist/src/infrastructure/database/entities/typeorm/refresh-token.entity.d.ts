export declare class RefreshTokenOrmEntity {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    isRevoked: boolean;
    deviceId?: string;
    userAgent?: string;
    ipAddress?: string;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    revokedAt?: Date;
    revokedReason?: string;
}
