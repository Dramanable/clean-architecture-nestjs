"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmUserRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_role_enum_1 = require("../../../shared/enums/user-role.enum");
const user_entity_1 = require("../entities/typeorm/user.entity");
const typeorm_user_mapper_1 = require("../mappers/typeorm-user.mapper");
let TypeOrmUserRepository = class TypeOrmUserRepository {
    userOrmRepository;
    userMapper;
    logger;
    i18n;
    constructor(userOrmRepository, userMapper, logger, i18n) {
        this.userOrmRepository = userOrmRepository;
        this.userMapper = userMapper;
        this.logger = logger;
        this.i18n = i18n;
    }
    async save(user) {
        try {
            this.logger.info(this.i18n.t('operations.user.save_attempt', {
                userId: user.id,
                email: user.email.value,
            }), { operation: 'UserRepository.save', userId: user.id });
            const ormEntity = this.userMapper.toOrmEntity(user);
            const savedOrmEntity = await this.userOrmRepository.save(ormEntity);
            const savedUser = this.userMapper.toDomainEntity(savedOrmEntity);
            this.logger.info(this.i18n.t('success.user.saved', {
                userId: savedUser.id,
                email: savedUser.email.value,
            }), { operation: 'UserRepository.save', userId: savedUser.id });
            return savedUser;
        }
        catch (error) {
            this.logger.error(this.i18n.t('errors.user.save_failed', {
                userId: user.id,
                error: error.message,
            }), error, { operation: 'UserRepository.save', userId: user.id });
            throw error;
        }
    }
    async findById(id) {
        try {
            this.logger.debug(this.i18n.t('operations.user.find_by_id_attempt', { userId: id }), { operation: 'UserRepository.findById', userId: id });
            const ormEntity = await this.userOrmRepository.findOne({
                where: { id },
            });
            if (!ormEntity) {
                this.logger.debug(this.i18n.t('info.user.not_found', { userId: id }), {
                    operation: 'UserRepository.findById',
                    userId: id,
                });
                return null;
            }
            const user = this.userMapper.toDomainEntity(ormEntity);
            this.logger.debug(this.i18n.t('success.user.found', {
                userId: user.id,
                email: user.email.value,
            }), { operation: 'UserRepository.findById', userId: id });
            return user;
        }
        catch (error) {
            this.logger.error(this.i18n.t('errors.user.find_failed', {
                userId: id,
                error: error.message,
            }), error, { operation: 'UserRepository.findById', userId: id });
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            this.logger.debug(this.i18n.t('operations.user.find_by_email_attempt', {
                email: email.value,
            }), { operation: 'UserRepository.findByEmail', email: email.value });
            const ormEntity = await this.userOrmRepository.findOne({
                where: { email: email.value.toLowerCase() },
            });
            if (!ormEntity) {
                this.logger.debug(this.i18n.t('info.user.not_found_by_email', { email: email.value }), { operation: 'UserRepository.findByEmail', email: email.value });
                return null;
            }
            const user = this.userMapper.toDomainEntity(ormEntity);
            this.logger.debug(this.i18n.t('success.user.found_by_email', {
                userId: user.id,
                email: user.email.value,
            }), { operation: 'UserRepository.findByEmail', email: email.value });
            return user;
        }
        catch (error) {
            this.logger.error(this.i18n.t('errors.user.find_by_email_failed', {
                email: email.value,
                error: error.message,
            }), error, { operation: 'UserRepository.findByEmail', email: email.value });
            throw error;
        }
    }
    async findAll(params) {
        try {
            const page = params?.page || 1;
            const limit = params?.limit || 10;
            const skip = (page - 1) * limit;
            this.logger.debug(this.i18n.t('operations.user.find_all_attempt', {
                page,
                limit,
            }), { operation: 'UserRepository.findAll', page, limit });
            const [ormEntities, totalItems] = await this.userOrmRepository.findAndCount({
                order: { createdAt: 'DESC' },
                skip,
                take: limit,
            });
            const users = ormEntities.map((entity) => this.userMapper.toDomainEntity(entity));
            const totalPages = Math.ceil(totalItems / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;
            const result = {
                data: users,
                meta: {
                    currentPage: page,
                    totalPages,
                    totalItems,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPreviousPage,
                },
            };
            this.logger.info(this.i18n.t('success.user.found_paginated', {
                count: users.length,
                totalItems,
                page,
            }), { operation: 'UserRepository.findAll', page, limit, totalItems });
            return result;
        }
        catch (error) {
            this.logger.error(this.i18n.t('errors.user.find_all_failed', {
                error: error.message,
            }), error, { operation: 'UserRepository.findAll', params });
            throw error;
        }
    }
    async search(params) {
        return this.findAll(params);
    }
    async findByRole(role, params) {
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const skip = (page - 1) * limit;
        const [ormEntities, totalItems] = await this.userOrmRepository.findAndCount({
            where: { role },
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        const users = ormEntities.map((entity) => this.userMapper.toDomainEntity(entity));
        return {
            data: users,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(totalItems / limit),
                totalItems,
                itemsPerPage: limit,
                hasNextPage: page < Math.ceil(totalItems / limit),
                hasPreviousPage: page > 1,
            },
        };
    }
    async update(user) {
        try {
            this.logger.info(this.i18n.t('operations.user.update_attempt', {
                userId: user.id,
                email: user.email.value,
            }), { operation: 'UserRepository.update', userId: user.id });
            const ormEntity = this.userMapper.toOrmEntity(user);
            const savedOrmEntity = await this.userOrmRepository.save(ormEntity);
            const updatedUser = this.userMapper.toDomainEntity(savedOrmEntity);
            this.logger.info(this.i18n.t('success.user.updated', {
                userId: updatedUser.id,
                email: updatedUser.email.value,
            }), { operation: 'UserRepository.update', userId: user.id });
            return updatedUser;
        }
        catch (error) {
            this.logger.error(this.i18n.t('errors.user.update_failed', {
                userId: user.id,
                error: error.message,
            }), error, { operation: 'UserRepository.update', userId: user.id });
            throw error;
        }
    }
    async delete(id) {
        try {
            this.logger.info(this.i18n.t('operations.user.delete_attempt', { userId: id }), { operation: 'UserRepository.delete', userId: id });
            const result = await this.userOrmRepository.delete(id);
            if (result.affected === 0) {
                throw new Error(this.i18n.t('errors.user.not_found', { userId: id }));
            }
            this.logger.info(this.i18n.t('success.user.deleted', { userId: id }), {
                operation: 'UserRepository.delete',
                userId: id,
            });
        }
        catch (error) {
            this.logger.error(this.i18n.t('errors.user.delete_failed', {
                userId: id,
                error: error.message,
            }), error, { operation: 'UserRepository.delete', userId: id });
            throw error;
        }
    }
    async emailExists(email) {
        const count = await this.userOrmRepository.count({
            where: { email: email.value.toLowerCase() },
        });
        return count > 0;
    }
    async countSuperAdmins() {
        return await this.userOrmRepository.count({
            where: { role: user_role_enum_1.UserRole.SUPER_ADMIN },
        });
    }
    async count() {
        return await this.userOrmRepository.count();
    }
    async countWithFilters(params) {
        return await this.userOrmRepository.count();
    }
    async updateBatch(users) {
        const ormEntities = users.map((user) => this.userMapper.toOrmEntity(user));
        const savedOrmEntities = await this.userOrmRepository.save(ormEntities);
        return savedOrmEntities.map((entity) => this.userMapper.toDomainEntity(entity));
    }
    async deleteBatch(ids) {
        if (ids.length === 0)
            return;
        const result = await this.userOrmRepository.delete(ids);
        if (result.affected !== ids.length) {
            throw new Error(this.i18n.t('errors.user.batch_delete_failed', {
                expected: ids.length,
                deleted: result.affected,
            }));
        }
    }
    async export(params) {
        const ormEntities = await this.userOrmRepository.find({
            order: { createdAt: 'DESC' },
        });
        return ormEntities.map((entity) => this.userMapper.toDomainEntity(entity));
    }
};
exports.TypeOrmUserRepository = TypeOrmUserRepository;
exports.TypeOrmUserRepository = TypeOrmUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_user_mapper_1.UserMapper, Object, Object])
], TypeOrmUserRepository);
//# sourceMappingURL=typeorm-user.repository-simple.js.map