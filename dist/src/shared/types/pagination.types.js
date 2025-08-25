"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
class QueryBuilder {
    params = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
    };
    page(page) {
        this.params.page = Math.max(1, page);
        return this;
    }
    limit(limit) {
        this.params.limit = Math.min(100, Math.max(1, limit));
        return this;
    }
    sortBy(field, order = 'ASC') {
        this.params.sortBy = field;
        this.params.sortOrder = order;
        return this;
    }
    search(query, fields) {
        this.params.search = { query, fields };
        return this;
    }
    filter(field, operator, value) {
        if (!this.params.filters) {
            this.params.filters = [];
        }
        this.params.filters.push({ field, operator, value });
        return this;
    }
    dateRange(field, from, to) {
        if (!this.params.dateFilters) {
            this.params.dateFilters = {};
        }
        this.params.dateFilters[field] = { from, to };
        return this;
    }
    build() {
        return { ...this.params };
    }
}
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=pagination.types.js.map