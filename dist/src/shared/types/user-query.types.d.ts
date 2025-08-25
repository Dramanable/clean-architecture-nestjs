import { UserRole } from '../enums/user-role.enum';
import { DateFilter } from './pagination.types';
export interface UserFilters {
    role?: UserRole | UserRole[];
    isActive?: boolean;
    emailDomain?: string;
    createdAt?: DateFilter;
    lastLoginAt?: DateFilter;
}
export interface UserSearchParams {
    query?: string;
    name?: string;
    email?: string;
    domain?: string;
}
export interface UserQueryParams {
    page: number;
    limit: number;
    sortBy?: UserSortField;
    sortOrder?: 'ASC' | 'DESC';
    search?: UserSearchParams;
    filters?: UserFilters;
}
export type UserSortField = 'name' | 'email' | 'role' | 'createdAt' | 'lastLoginAt';
export declare class UserQueryBuilder {
    private params;
    page(page: number): this;
    limit(limit: number): this;
    sortBy(field: UserSortField, order?: 'ASC' | 'DESC'): this;
    searchByName(name: string): this;
    searchByEmail(email: string): this;
    searchByDomain(domain: string): this;
    searchGlobal(query: string): this;
    filterByRole(role: UserRole | UserRole[]): this;
    filterByActive(isActive: boolean): this;
    filterByEmailDomain(domain: string): this;
    filterByCreationDate(from?: Date, to?: Date): this;
    filterByLastLogin(from?: Date, to?: Date): this;
    onlyAdmins(): this;
    onlyManagers(): this;
    onlyUsers(): this;
    recentlyCreated(days?: number): this;
    activeUsersOnly(): this;
    build(): UserQueryParams;
}
