import { RefreshTokenRepository } from '../../../application/use-cases/users/login.use-case';
import { UserRepository } from '../../../domain/repositories/user.repository';
import type { DatabaseType } from '../config/database-config.service';
export interface DatabaseRepositoryFactory {
    createUserRepository(): UserRepository;
    createRefreshTokenRepository(): RefreshTokenRepository;
}
export declare class SqlRepositoryFactory implements DatabaseRepositoryFactory {
    createUserRepository(): UserRepository;
    createRefreshTokenRepository(): RefreshTokenRepository;
}
export declare class MongoRepositoryFactory implements DatabaseRepositoryFactory {
    createUserRepository(): UserRepository;
    createRefreshTokenRepository(): RefreshTokenRepository;
}
export declare class DatabaseRepositoryFactoryProvider {
    private readonly databaseType;
    constructor(databaseType: DatabaseType);
    static create(databaseType: DatabaseType): DatabaseRepositoryFactory;
}
export declare const DATABASE_REPOSITORY_FACTORY: unique symbol;
export declare const databaseRepositoryFactoryProvider: {
    provide: symbol;
    useFactory: (databaseType: DatabaseType) => DatabaseRepositoryFactory;
    inject: string[];
};
