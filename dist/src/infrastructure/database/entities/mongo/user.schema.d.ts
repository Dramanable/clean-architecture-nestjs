import { Document } from 'mongoose';
import { UserRole } from '../../../../shared/enums/user-role.enum';
export type UserDocument = User & Document;
export declare class User {
    _id: string;
    email: string;
    name: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    lastLoginIp?: string;
    loginAttempts: number;
    lockedUntil?: Date;
    emailVerified: boolean;
    emailVerifiedAt?: Date;
    tenantId?: string;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
