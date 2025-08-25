"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
const user_entity_1 = require("../../../domain/entities/user.entity");
const email_vo_1 = require("../../../domain/value-objects/email.vo");
const user_entity_2 = require("../entities/typeorm/user.entity");
class UserMapper {
    toDomainEntity(ormEntity) {
        return UserMapper.toDomain(ormEntity);
    }
    toOrmEntity(domainEntity) {
        return UserMapper.toOrm(domainEntity);
    }
    static toDomain(ormEntity) {
        const user = new user_entity_1.User(new email_vo_1.Email(ormEntity.email), ormEntity.name, ormEntity.role);
        user.id = ormEntity.id;
        user.hashedPassword = ormEntity.password;
        user.createdAt = ormEntity.createdAt;
        user.updatedAt = ormEntity.updatedAt;
        return user;
    }
    static toOrm(domainEntity) {
        const ormEntity = new user_entity_2.UserOrmEntity();
        ormEntity.id = domainEntity.id;
        ormEntity.email = domainEntity.email.value;
        ormEntity.name = domainEntity.name;
        ormEntity.role = domainEntity.role;
        ormEntity.password = domainEntity.hashedPassword || '';
        ormEntity.isActive = true;
        ormEntity.emailVerified = false;
        ormEntity.loginAttempts = 0;
        if (domainEntity.createdAt) {
            ormEntity.createdAt = domainEntity.createdAt;
        }
        if (domainEntity.updatedAt) {
            ormEntity.updatedAt = domainEntity.updatedAt;
        }
        return ormEntity;
    }
    static updateOrm(ormEntity, domainEntity) {
        ormEntity.email = domainEntity.email.value;
        ormEntity.name = domainEntity.name;
        ormEntity.role = domainEntity.role;
        if (domainEntity.hashedPassword) {
            ormEntity.password = domainEntity.hashedPassword;
        }
        return ormEntity;
    }
    static toDomainList(ormEntities) {
        return ormEntities.map((ormEntity) => this.toDomain(ormEntity));
    }
    static toOrmList(domainEntities) {
        return domainEntities.map((domainEntity) => this.toOrm(domainEntity));
    }
}
exports.UserMapper = UserMapper;
//# sourceMappingURL=typeorm-user.mapper.js.map