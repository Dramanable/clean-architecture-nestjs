import { User } from '../../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/typeorm/user.entity';
export declare class UserMapper {
    toDomainEntity(ormEntity: UserOrmEntity): User;
    toOrmEntity(domainEntity: User): UserOrmEntity;
    static toDomain(ormEntity: UserOrmEntity): User;
    static toOrm(domainEntity: User): UserOrmEntity;
    static updateOrm(ormEntity: UserOrmEntity, domainEntity: User): UserOrmEntity;
    static toDomainList(ormEntities: UserOrmEntity[]): User[];
    static toOrmList(domainEntities: User[]): UserOrmEntity[];
}
