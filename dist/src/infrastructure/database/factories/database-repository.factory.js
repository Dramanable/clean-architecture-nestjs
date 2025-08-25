"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseRepositoryFactoryProvider = exports.DATABASE_REPOSITORY_FACTORY = exports.DatabaseRepositoryFactoryProvider = exports.MongoRepositoryFactory = exports.SqlRepositoryFactory = void 0;
const common_1 = require("@nestjs/common");
let SqlRepositoryFactory = class SqlRepositoryFactory {
    createUserRepository() {
        const { TypeOrmUserRepository, } = require('../repositories/sql/user.repository.impl');
        return new TypeOrmUserRepository();
    }
    createRefreshTokenRepository() {
        const { TypeOrmRefreshTokenRepository, } = require('../repositories/sql/refresh-token.repository.impl');
        return new TypeOrmRefreshTokenRepository();
    }
};
exports.SqlRepositoryFactory = SqlRepositoryFactory;
exports.SqlRepositoryFactory = SqlRepositoryFactory = __decorate([
    (0, common_1.Injectable)()
], SqlRepositoryFactory);
let MongoRepositoryFactory = class MongoRepositoryFactory {
    createUserRepository() {
        const { MongoUserRepository, } = require('../repositories/mongo/user.repository.impl');
        return new MongoUserRepository();
    }
    createRefreshTokenRepository() {
        const { MongoRefreshTokenRepository, } = require('../repositories/mongo/refresh-token.repository.impl');
        return new MongoRefreshTokenRepository();
    }
};
exports.MongoRepositoryFactory = MongoRepositoryFactory;
exports.MongoRepositoryFactory = MongoRepositoryFactory = __decorate([
    (0, common_1.Injectable)()
], MongoRepositoryFactory);
let DatabaseRepositoryFactoryProvider = class DatabaseRepositoryFactoryProvider {
    databaseType;
    constructor(databaseType) {
        this.databaseType = databaseType;
    }
    static create(databaseType) {
        switch (databaseType) {
            case 'postgresql':
            case 'mysql':
            case 'sqlite':
                return new SqlRepositoryFactory();
            case 'mongodb':
                return new MongoRepositoryFactory();
            default:
                throw new Error(`Unsupported database type: ${databaseType}`);
        }
    }
};
exports.DatabaseRepositoryFactoryProvider = DatabaseRepositoryFactoryProvider;
exports.DatabaseRepositoryFactoryProvider = DatabaseRepositoryFactoryProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [String])
], DatabaseRepositoryFactoryProvider);
exports.DATABASE_REPOSITORY_FACTORY = Symbol('DATABASE_REPOSITORY_FACTORY');
exports.databaseRepositoryFactoryProvider = {
    provide: exports.DATABASE_REPOSITORY_FACTORY,
    useFactory: (databaseType) => {
        return DatabaseRepositoryFactoryProvider.create(databaseType);
    },
    inject: ['DATABASE_TYPE'],
};
//# sourceMappingURL=database-repository.factory.js.map