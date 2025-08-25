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
exports.DatabaseConfigService = void 0;
const common_1 = require("@nestjs/common");
const app_config_service_1 = require("../../config/app-config.service");
let DatabaseConfigService = class DatabaseConfigService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    createTypeOrmOptions() {
        const config = this.getDatabaseConfig();
        if (config.type === 'mongodb') {
            throw new Error('TypeORM configuration requested but MongoDB is configured. Use Mongoose instead.');
        }
        const isProduction = this.configService.getEnvironment() === 'production';
        return {
            type: config.type,
            host: config.host,
            port: config.port,
            username: config.username,
            password: config.password,
            database: config.database,
            ssl: config.ssl,
            entities: this.getEntitiesPaths(config.type),
            ...this.getMigrationConfig(),
            synchronize: !isProduction,
            logging: !isProduction ? ['query', 'error', 'warn'] : ['error'],
            logger: isProduction ? 'file' : 'debug',
            poolSize: config.poolSize,
            maxQueryExecutionTime: 5000,
            cache: this.getCacheConfig(),
            extra: config.options,
        };
    }
    getDatabaseConfig() {
        const dbType = this.configService.getDatabaseType();
        return {
            type: dbType,
            host: this.configService.getDatabaseHost(),
            port: this.configService.getDatabasePort(),
            username: this.configService.getDatabaseUsername(),
            password: this.configService.getDatabasePassword(),
            database: this.configService.getDatabaseName(),
            poolSize: this.configService.getDatabasePoolSize(),
            ssl: this.getSSLConfig(),
            options: this.getDatabaseSpecificOptions(dbType),
        };
    }
    getSSLConfig() {
        const isProduction = this.configService.getEnvironment() === 'production';
        if (!isProduction)
            return false;
        return {
            rejectUnauthorized: false,
        };
    }
    getDatabaseSpecificOptions(dbType) {
        switch (dbType) {
            case 'postgresql':
                return {
                    max: this.configService.getDatabasePoolSize(),
                    connectionTimeoutMillis: 10000,
                    idleTimeoutMillis: 30000,
                    acquireTimeoutMillis: 60000,
                };
            case 'mongodb':
                return {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    maxPoolSize: this.configService.getDatabasePoolSize(),
                    serverSelectionTimeoutMS: 5000,
                    socketTimeoutMS: 45000,
                };
            case 'mysql':
                return {
                    charset: 'utf8mb4',
                    timezone: '+00:00',
                };
            case 'sqlite':
                return {
                    database: ':memory:',
                };
            default:
                return {};
        }
    }
    getEntitiesPaths(dbType) {
        switch (dbType) {
            case 'postgresql':
            case 'mysql':
                return [__dirname + '/../entities/sql/*.entity.{ts,js}'];
            case 'sqlite':
                return [__dirname + '/../entities/sql/*.entity.{ts,js}'];
            default:
                return [];
        }
    }
    getMigrationConfig() {
        const dbType = this.configService.getDatabaseType();
        if (dbType === 'mongodb') {
            return {};
        }
        return {
            migrations: [__dirname + '/../migrations/' + dbType + '/*.{ts,js}'],
            migrationsTableName: 'typeorm_migrations',
            migrationsRun: false,
        };
    }
    getCacheConfig() {
        return {
            type: 'redis',
            options: {
                host: this.configService.getRedisHost(),
                port: this.configService.getRedisPort(),
                password: this.configService.getRedisPassword(),
            },
            duration: 30000,
        };
    }
};
exports.DatabaseConfigService = DatabaseConfigService;
exports.DatabaseConfigService = DatabaseConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService])
], DatabaseConfigService);
//# sourceMappingURL=database-config.service.js.map