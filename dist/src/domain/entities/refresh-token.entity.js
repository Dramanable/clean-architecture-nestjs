"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
class RefreshToken {
    id;
    userId;
    tokenHash;
    deviceId;
    userAgent;
    ipAddress;
    expiresAt;
    createdAt;
    isRevoked;
    revokedAt;
    revokedReason;
    constructor(userId, token, expiresAt, deviceId, userAgent, ipAddress, skipValidation = false) {
        if (!skipValidation) {
            this.validateInputs(userId, token, expiresAt);
        }
        else {
            this.validateBasicInputs(userId, token);
        }
        this.id = this.generateId();
        this.userId = userId;
        this.tokenHash = this.hashToken(token);
        this.deviceId = deviceId;
        this.userAgent = userAgent;
        this.ipAddress = ipAddress;
        this.expiresAt = expiresAt;
        this.createdAt = new Date();
        this.isRevoked = false;
    }
    revoke(reason) {
        if (this.isRevoked) {
            throw new Error('Token is already revoked');
        }
        return new RefreshToken(this.userId, 'dummy-token-for-revoked-with-minimum-length-32chars', this.expiresAt, this.deviceId, this.userAgent, this.ipAddress, true).withRevocation(reason);
    }
    verifyToken(plainToken) {
        return this.hashToken(plainToken) === this.tokenHash;
    }
    isValid() {
        const now = new Date();
        return !this.isRevoked && now < this.expiresAt;
    }
    isExpired() {
        const now = new Date();
        return now >= this.expiresAt;
    }
    getTimeToExpiry() {
        const now = new Date();
        const diffMs = this.expiresAt.getTime() - now.getTime();
        return Math.max(0, Math.floor(diffMs / 1000));
    }
    matchesDevice(deviceId, userAgent) {
        if (this.deviceId && deviceId) {
            return this.deviceId === deviceId;
        }
        if (this.userAgent && userAgent) {
            return this.userAgent === userAgent;
        }
        return true;
    }
    withRevocation(reason) {
        const revoked = Object.create(RefreshToken.prototype);
        Object.assign(revoked, this);
        Object.defineProperties(revoked, {
            isRevoked: { value: true, writable: false },
            revokedAt: { value: new Date(), writable: false },
            revokedReason: { value: reason, writable: false },
        });
        return revoked;
    }
    validateInputs(userId, token, expiresAt) {
        this.validateBasicInputs(userId, token);
        if (expiresAt <= new Date()) {
            throw new Error('Expiration date must be in the future');
        }
        const maxExpiry = new Date();
        maxExpiry.setFullYear(maxExpiry.getFullYear() + 1);
        if (expiresAt > maxExpiry) {
            throw new Error('Expiration date cannot be more than 1 year in the future');
        }
    }
    validateBasicInputs(userId, token) {
        if (!userId || userId.trim().length === 0) {
            throw new Error('User ID cannot be empty');
        }
        if (!token || token.trim().length === 0) {
            throw new Error('Token cannot be empty');
        }
        if (token.length < 32) {
            throw new Error('Token must be at least 32 characters long');
        }
    }
    hashToken(token) {
        let hash = 0;
        for (let i = 0; i < token.length; i++) {
            const char = token.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return `hash_${Math.abs(hash).toString(16)}`;
    }
    generateId() {
        return ('rt_' +
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15));
    }
    equals(other) {
        return this.id === other.id;
    }
    toString() {
        return `RefreshToken(id=${this.id}, userId=${this.userId}, valid=${this.isValid()})`;
    }
    static reconstruct(id, userId, tokenHash, expiresAt, metadata, isRevoked = false, revokedAt, createdAt, _updatedAt) {
        const tempToken = 'temp-reconstruction-token-32chars-min';
        const instance = new RefreshToken(userId, tempToken, expiresAt, metadata.deviceId, metadata.userAgent, metadata.ipAddress, true);
        instance.id = id;
        instance.tokenHash = tokenHash;
        instance.isRevoked = isRevoked;
        instance.revokedAt = revokedAt;
        instance.createdAt = createdAt || new Date();
        return instance;
    }
}
exports.RefreshToken = RefreshToken;
//# sourceMappingURL=refresh-token.entity.js.map