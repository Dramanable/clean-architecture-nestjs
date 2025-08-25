"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUserMapper = void 0;
const user_entity_1 = require("../../../domain/entities/user.entity");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
class MongoUserMapper {
    static toDomain(mongoDoc) {
        const user = new user_entity_1.User(new email_vo_1.Email(mongoDoc.email), mongoDoc.name, mongoDoc.role);
        user.id = mongoDoc._id;
        user._password = mongoDoc.password;
        user._lastLoginAt = mongoDoc.lastLoginAt;
        user._lastLoginIp = mongoDoc.lastLoginIp;
        user._loginAttempts = mongoDoc.loginAttempts || 0;
        user._lockedUntil = mongoDoc.lockedUntil;
        user._emailVerified = mongoDoc.emailVerified || false;
        user._createdAt = mongoDoc.createdAt;
        user._updatedAt = mongoDoc.updatedAt;
        return user;
    }
    static toMongo(domainEntity) {
        return {
            _id: domainEntity.id,
            email: domainEntity.email.value,
            name: domainEntity.name,
            password: domainEntity._password || '',
            role: domainEntity.role,
            isActive: true,
            lastLoginAt: domainEntity._lastLoginAt,
            lastLoginIp: domainEntity._lastLoginIp,
            loginAttempts: domainEntity._loginAttempts || 0,
            lockedUntil: domainEntity._lockedUntil,
            emailVerified: domainEntity._emailVerified || false,
            emailVerifiedAt: domainEntity._emailVerifiedAt,
            tenantId: domainEntity._tenantId,
            metadata: domainEntity._metadata,
        };
    }
    static updateMongo(mongoDoc, domainEntity) {
        mongoDoc.email = domainEntity.email.value;
        mongoDoc.name = domainEntity.name;
        mongoDoc.role = domainEntity.role;
        const newPassword = domainEntity._password;
        if (newPassword) {
            mongoDoc.password = newPassword;
        }
        mongoDoc.lastLoginAt = domainEntity._lastLoginAt;
        mongoDoc.lastLoginIp = domainEntity._lastLoginIp;
        mongoDoc.loginAttempts = domainEntity._loginAttempts || 0;
        mongoDoc.lockedUntil = domainEntity._lockedUntil;
        mongoDoc.emailVerified = domainEntity._emailVerified || false;
        return mongoDoc;
    }
    static toDomainList(mongoDocs) {
        return mongoDocs.map((doc) => this.toDomain(doc));
    }
    static toMongoList(domainEntities) {
        return domainEntities.map((entity) => this.toMongo(entity));
    }
}
exports.MongoUserMapper = MongoUserMapper;
//# sourceMappingURL=mongo-user.mapper.js.map