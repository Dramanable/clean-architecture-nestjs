export interface MongoMigration {
    version: number;
    name: string;
    up(): Promise<void>;
    down(): Promise<void>;
}
export declare class MongoMigrationRunner {
    private connectionString;
    constructor();
    private buildConnectionString;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    runMigrations(migrations: MongoMigration[]): Promise<void>;
    revertLastMigration(migrations: MongoMigration[]): Promise<void>;
}
