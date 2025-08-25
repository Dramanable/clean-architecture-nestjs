"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DatabaseModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const typeorm_1 = require("@nestjs/typeorm");
const app_config_service_1 = require("../config/app-config.service");
const database_config_service_1 = require("./config/database-config.service");
const mongo_config_service_1 = require("./config/mongo-config.service");
const refresh_token_entity_1 = require("./entities/typeorm/refresh-token.entity");
const user_entity_1 = require("./entities/typeorm/user.entity");
const refresh_token_schema_1 = require("./entities/mongo/refresh-token.schema");
const user_schema_1 = require("./entities/mongo/user.schema");
let DatabaseModule = DatabaseModule_1 = class DatabaseModule {
    static forRoot() {
        const databaseType = process.env.DATABASE_TYPE || 'postgresql';
        const baseModule = {
            module: DatabaseModule_1,
            imports: [config_1.ConfigModule],
            providers: [app_config_service_1.AppConfigService],
            exports: [app_config_service_1.AppConfigService],
        };
        switch (databaseType) {
            case 'postgresql':
            case 'mysql':
            case 'sqlite':
                return this.createSqlModule(baseModule);
            case 'mongodb':
                return this.createMongoModule(baseModule);
            default:
                throw new Error(`Unsupported database type: ${databaseType}`);
        }
    }
    static createSqlModule(baseModule) {
        return {
            ...baseModule,
            imports: [
                ...baseModule.imports,
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: (configService) => {
                        if (configService.get('DATABASE_TYPE', 'postgresql') === 'mongodb') {
                            throw new Error('TypeORM configuration requested but MongoDB is configured. Use Mongoose instead.');
                        }
                        const isProduction = configService.get('NODE_ENV', 'development') === 'production';
                        return {
                            type: 'postgres',
                            host: configService.get('DATABASE_HOST', 'localhost'),
                            port: configService.get('DATABASE_PORT', 5432),
                            username: configService.get('DATABASE_USERNAME', 'admin'),
                            password: configService.get('DATABASE_PASSWORD'),
                            database: configService.get('DATABASE_NAME', 'cleanarchi'),
                            entities: [user_entity_1.UserOrmEntity, refresh_token_entity_1.RefreshTokenOrmEntity],
                            synchronize: !isProduction,
                            logging: !isProduction,
                            dropSchema: false,
                            extra: {
                                max: configService.get('DATABASE_POOL_SIZE', 10),
                                idleTimeoutMillis: 30000,
                                connectionTimeoutMillis: 5000,
                            },
                            ssl: false,
                            migrations: ['dist/infrastructure/database/migrations/sql/*.js'],
                            migrationsRun: false,
                            migrationsTableName: 'sql_migrations_history',
                        };
                    },
                    inject: [config_1.ConfigService],
                }),
                typeorm_1.TypeOrmModule.forFeature([user_entity_1.UserOrmEntity, refresh_token_entity_1.RefreshTokenOrmEntity]),
            ],
            providers: [...baseModule.providers, database_config_service_1.DatabaseConfigService],
            exports: [...baseModule.exports, database_config_service_1.DatabaseConfigService, typeorm_1.TypeOrmModule],
        };
    }
    static createMongoModule(baseModule) {
        return {
            ...baseModule,
            imports: [
                ...baseModule.imports,
                mongoose_1.MongooseModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useClass: mongo_config_service_1.MongoConfigService,
                    inject: [app_config_service_1.AppConfigService],
                }),
                mongoose_1.MongooseModule.forFeature([
                    { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                    { name: refresh_token_schema_1.RefreshToken.name, schema: refresh_token_schema_1.RefreshTokenSchema },
                ]),
            ],
            providers: [...baseModule.providers, mongo_config_service_1.MongoConfigService],
            exports: [...baseModule.exports, mongo_config_service_1.MongoConfigService, mongoose_1.MongooseModule],
        };
    }
    static forTesting(databaseType = 'sql') {
        const baseModule = {
            module: DatabaseModule_1,
            providers: [app_config_service_1.AppConfigService],
            exports: [app_config_service_1.AppConfigService],
        };
        if (databaseType === 'sql') {
            return {
                ...baseModule,
                imports: [
                    typeorm_1.TypeOrmModule.forRoot({
                        type: 'sqlite',
                        database: ':memory:',
                        entities: [user_entity_1.UserOrmEntity, refresh_token_entity_1.RefreshTokenOrmEntity],
                        synchronize: true,
                        logging: false,
                    }),
                    typeorm_1.TypeOrmModule.forFeature([user_entity_1.UserOrmEntity, refresh_token_entity_1.RefreshTokenOrmEntity]),
                ],
                exports: [...baseModule.exports, typeorm_1.TypeOrmModule],
            };
        }
        else {
            return {
                ...baseModule,
                imports: [
                    mongoose_1.MongooseModule.forRoot('mongodb://localhost:27017/test'),
                    mongoose_1.MongooseModule.forFeature([
                        { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                        { name: refresh_token_schema_1.RefreshToken.name, schema: refresh_token_schema_1.RefreshTokenSchema },
                    ]),
                ],
                exports: [...baseModule.exports, mongoose_1.MongooseModule],
            };
        }
    }
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = DatabaseModule_1 = __decorate([
    (0, common_1.Module)({})
], DatabaseModule);
//# sourceMappingURL=database.module.js.map