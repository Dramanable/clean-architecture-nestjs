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
exports.MongoConfigService = void 0;
const common_1 = require("@nestjs/common");
let MongoConfigService = class MongoConfigService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    createMongooseOptions() {
        const config = this.configService;
        const isProduction = config.getEnvironment() === 'production';
        const uri = this.buildMongoUri();
        return {
            uri,
            authSource: 'admin',
            maxPoolSize: config.getDatabasePoolSize(),
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            retryReads: true,
            maxStalenessSeconds: 90,
            bufferCommands: false,
            ...(isProduction
                ? this.getProductionOptions()
                : this.getDevelopmentOptions()),
        };
    }
    buildMongoUri() {
        const config = this.configService;
        const host = config.getDatabaseHost();
        const port = config.getDatabasePort();
        const username = config.getDatabaseUsername();
        const password = config.getDatabasePassword();
        const database = config.getDatabaseName();
        if (host.includes(',')) {
            return `mongodb://${username}:${password}@${host}/${database}`;
        }
        return `mongodb://${username}:${password}@${host}:${port}/${database}`;
    }
    getProductionOptions() {
        return {
            ssl: true,
            readPreference: 'primaryPreferred',
            writeConcern: {
                w: 'majority',
                j: true,
                wtimeout: 5000,
            },
            compressors: ['zstd', 'zlib'],
            monitorCommands: true,
        };
    }
    getDevelopmentOptions() {
        return {
            ssl: false,
            monitorCommands: true,
            readPreference: 'primary',
            writeConcern: {
                w: 1,
                j: false,
            },
        };
    }
    static getTestOptions() {
        return {
            uri: 'mongodb://localhost:27017/cleanarchi_test',
            bufferCommands: false,
        };
    }
};
exports.MongoConfigService = MongoConfigService;
exports.MongoConfigService = MongoConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], MongoConfigService);
//# sourceMappingURL=mongo-config.service.js.map