import { DynamicModule } from '@nestjs/common';
export declare class DatabaseModule {
    static forRoot(): DynamicModule;
    private static createSqlModule;
    private static createMongoModule;
    static forTesting(databaseType?: 'sql' | 'mongo'): DynamicModule;
}
