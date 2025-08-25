"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserQueryBuilder = void 0;
const user_role_enum_1 = require("../enums/user-role.enum");
class UserQueryBuilder {
    params = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
        search: {},
        filters: {}
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
    searchByName(name) {
        if (!this.params.search)
            this.params.search = {};
        this.params.search.name = name;
        return this;
    }
    searchByEmail(email) {
        if (!this.params.search)
            this.params.search = {};
        this.params.search.email = email;
        return this;
    }
    searchByDomain(domain) {
        if (!this.params.search)
            this.params.search = {};
        this.params.search.domain = domain;
        return this;
    }
    searchGlobal(query) {
        if (!this.params.search)
            this.params.search = {};
        this.params.search.query = query;
        return this;
    }
    filterByRole(role) {
        if (!this.params.filters)
            this.params.filters = {};
        this.params.filters.role = role;
        return this;
    }
    filterByActive(isActive) {
        if (!this.params.filters)
            this.params.filters = {};
        this.params.filters.isActive = isActive;
        return this;
    }
    filterByEmailDomain(domain) {
        if (!this.params.filters)
            this.params.filters = {};
        this.params.filters.emailDomain = domain;
        return this;
    }
    filterByCreationDate(from, to) {
        if (!this.params.filters)
            this.params.filters = {};
        this.params.filters.createdAt = { from, to };
        return this;
    }
    filterByLastLogin(from, to) {
        if (!this.params.filters)
            this.params.filters = {};
        this.params.filters.lastLoginAt = { from, to };
        return this;
    }
    onlyAdmins() {
        return this.filterByRole([user_role_enum_1.UserRole.SUPER_ADMIN]);
    }
    onlyManagers() {
        return this.filterByRole([user_role_enum_1.UserRole.MANAGER]);
    }
    onlyUsers() {
        return this.filterByRole([user_role_enum_1.UserRole.USER]);
    }
    recentlyCreated(days = 7) {
        const from = new Date();
        from.setDate(from.getDate() - days);
        return this.filterByCreationDate(from);
    }
    activeUsersOnly() {
        return this.filterByActive(true);
    }
    build() {
        return { ...this.params };
    }
}
exports.UserQueryBuilder = UserQueryBuilder;
//# sourceMappingURL=user-query.types.js.map