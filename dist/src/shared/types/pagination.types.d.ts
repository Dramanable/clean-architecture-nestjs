export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage?: number;
    previousPage?: number;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}
export interface SearchParams {
    query?: string;
    fields?: string[];
}
export interface DateFilter {
    from?: Date;
    to?: Date;
}
export interface Filter {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like' | 'ilike';
    value: any;
}
export interface QueryParams extends PaginationParams {
    search?: SearchParams;
    filters?: Filter[];
    dateFilters?: Record<string, DateFilter>;
}
export declare class QueryBuilder {
    private params;
    page(page: number): this;
    limit(limit: number): this;
    sortBy(field: string, order?: 'ASC' | 'DESC'): this;
    search(query: string, fields?: string[]): this;
    filter(field: string, operator: Filter['operator'], value: any): this;
    dateRange(field: string, from?: Date, to?: Date): this;
    build(): QueryParams;
}
