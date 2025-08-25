"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmUserRepository = void 0;
const common_1 = require("@nestjs/common");
let TypeOrmUserRepository = class TypeOrmUserRepository {
    async save(user) {
        return user;
    }
    async findById(id) {
        return null;
    }
    async findByEmail(email) {
        return null;
    }
    async delete(id) {
    }
    async findAll(params) {
        return {
            data: [],
            meta: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 10, hasNextPage: false, hasPreviousPage: false },
        };
    }
    async search(params) {
        return this.findAll(params);
    }
    async findByRole(role, params) {
        return this.findAll(params);
    }
    async emailExists(email) {
        return false;
    }
    async countSuperAdmins() {
        return 0;
    }
    async count() {
        return 0;
    }
    async countWithFilters(params) {
        return 0;
    }
    async update(user) {
        return user;
    }
    async updateBatch(users) {
        return users;
    }
    async deleteBatch(ids) {
    }
    async export(params) {
        return [];
    }
};
exports.TypeOrmUserRepository = TypeOrmUserRepository;
exports.TypeOrmUserRepository = TypeOrmUserRepository = __decorate([
    (0, common_1.Injectable)()
], TypeOrmUserRepository);
//# sourceMappingURL=typeorm-user.repository.js.map