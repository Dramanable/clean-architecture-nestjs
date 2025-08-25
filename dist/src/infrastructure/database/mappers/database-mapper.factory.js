"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapperService = exports.DatabaseMapperFactory = void 0;
const common_1 = require("@nestjs/common");
const typeorm_user_mapper_1 = require("./typeorm-user.mapper");
let DatabaseMapperFactory = class DatabaseMapperFactory {
    createUserMapper(databaseType) {
        return new TypeOrmUserMapperAdapter();
    }
};
exports.DatabaseMapperFactory = DatabaseMapperFactory;
exports.DatabaseMapperFactory = DatabaseMapperFactory = __decorate([
    (0, common_1.Injectable)()
], DatabaseMapperFactory);
class TypeOrmUserMapperAdapter {
    toDomainEntity(ormEntity) {
        return typeorm_user_mapper_1.UserMapper.toDomain(ormEntity);
    }
    toOrmEntity(domainEntity) {
        return typeorm_user_mapper_1.UserMapper.toOrm(domainEntity);
    }
    toDomainList(ormEntities) {
        return typeorm_user_mapper_1.UserMapper.toDomainList(ormEntities);
    }
    toOrmList(domainEntities) {
        return typeorm_user_mapper_1.UserMapper.toOrmList(domainEntities);
    }
    updateOrm(ormEntity, domainEntity) {
        return typeorm_user_mapper_1.UserMapper.updateOrm(ormEntity, domainEntity);
    }
}
class MapperService {
    mapperFactory;
    databaseType;
    userMapper;
    constructor(mapperFactory, databaseType) {
        this.mapperFactory = mapperFactory;
        this.databaseType = databaseType;
        this.userMapper = this.mapperFactory.createUserMapper(this.databaseType);
    }
    getUserMapper() {
        return this.userMapper;
    }
    switchDatabase(newDatabaseType) {
        this.userMapper = this.mapperFactory.createUserMapper(newDatabaseType);
    }
}
exports.MapperService = MapperService;
//# sourceMappingURL=database-mapper.factory.js.map