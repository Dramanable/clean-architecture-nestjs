import { User as DomainUser } from '../../../domain/entities/user.entity';
import { UserDocument } from '../entities/mongo/user.schema';
export declare class MongoUserMapper {
    static toDomain(mongoDoc: UserDocument): DomainUser;
    static toMongo(domainEntity: DomainUser): Partial<UserDocument>;
    static updateMongo(mongoDoc: UserDocument, domainEntity: DomainUser): UserDocument;
    static toDomainList(mongoDocs: UserDocument[]): DomainUser[];
    static toMongoList(domainEntities: DomainUser[]): Partial<UserDocument>[];
}
