import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { UserRole } from '../../shared/enums/user-role.enum';
import { PaginatedResult } from '../../shared/types/pagination.types';
import { UserQueryParams } from '../../shared/types/user-query.types';
export interface UserRepository {
    save(user: User): Promise<User>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: Email): Promise<User | null>;
    delete(id: string): Promise<void>;
    findAll(params?: UserQueryParams): Promise<PaginatedResult<User>>;
    search(params: UserQueryParams): Promise<PaginatedResult<User>>;
    findByRole(role: UserRole, params?: UserQueryParams): Promise<PaginatedResult<User>>;
    delete(id: string): Promise<void>;
    emailExists(email: Email): Promise<boolean>;
    countSuperAdmins(): Promise<number>;
    count(): Promise<number>;
    countWithFilters(params: UserQueryParams): Promise<number>;
    update(user: User): Promise<User>;
    updateBatch(users: User[]): Promise<User[]>;
    deleteBatch(ids: string[]): Promise<void>;
    export(params?: UserQueryParams): Promise<User[]>;
}
