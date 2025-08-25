import { User } from '../../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/typeorm/user.entity';
export type DatabaseType = 'postgresql' | 'mysql' | 'sqlite' | 'typeorm';
export interface IUserMapper<TEntity = UserOrmEntity> {
    toDomainEntity(ormEntity: TEntity): User;
    toOrmEntity(domainEntity: User): TEntity;
    toDomainList(ormEntities: TEntity[]): User[];
    toOrmList(domainEntities: User[]): TEntity[];
    updateOrm(ormEntity: TEntity, domainEntity: User): TEntity;
}
export declare class DatabaseMapperFactory {
    createUserMapper(databaseType: DatabaseType): IUserMapper;
}
export declare class MapperService {
    private readonly mapperFactory;
    private readonly databaseType;
    private userMapper;
    constructor(mapperFactory: DatabaseMapperFactory, databaseType: DatabaseType);
    getUserMapper(): IUserMapper;
    switchDatabase(newDatabaseType: DatabaseType): void;
}
