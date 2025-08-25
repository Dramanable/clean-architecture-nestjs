import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { AppConfigService } from '../../config/app-config.service';
export type DatabaseType = 'postgresql' | 'mongodb' | 'mysql' | 'sqlite';
export interface DatabaseConfig {
    type: DatabaseType;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    poolSize: number;
    ssl?: boolean | object;
    options?: Record<string, any>;
}
export declare class DatabaseConfigService implements TypeOrmOptionsFactory {
    private readonly configService;
    constructor(configService: AppConfigService);
    createTypeOrmOptions(): TypeOrmModuleOptions;
    getDatabaseConfig(): DatabaseConfig;
    private getSSLConfig;
    private getDatabaseSpecificOptions;
    private getEntitiesPaths;
    private getMigrationConfig;
    private getCacheConfig;
}
