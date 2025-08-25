import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
import type { IConfigService } from '../../../application/ports/config.port';
export declare class MongoConfigService implements MongooseOptionsFactory {
    private readonly configService;
    constructor(configService: IConfigService);
    createMongooseOptions(): MongooseModuleOptions;
    private buildMongoUri;
    private getProductionOptions;
    private getDevelopmentOptions;
    static getTestOptions(): MongooseModuleOptions;
}
