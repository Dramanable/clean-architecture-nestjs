/**
 * 🏗️ INFRASTRUCTURE - TypeORM User Repository (Simplifié)
 *
 * Implémentation concrète du UserRepository pour PostgreSQL avec TypeORM
 * Version initiale pour démarrer rapidement
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { PaginatedResult } from '../../../shared/types/pagination.types';
import { UserQueryParams } from '../../../shared/types/user-query.types';
import { UserOrmEntity } from '../entities/typeorm/user.entity';
import { UserMapper } from '../mappers/typeorm-user.mapper';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userOrmRepository: Repository<UserOrmEntity>,
    private readonly userMapper: UserMapper,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async save(user: User): Promise<User> {
    try {
      this.logger.info(
        this.i18n.t('operations.user.save_attempt', {
          userId: user.id,
          email: user.email.value,
        }),
        { operation: 'UserRepository.save', userId: user.id },
      );

      // Convert Domain Entity → ORM Entity
      const ormEntity = this.userMapper.toOrmEntity(user);

      // Save to database
      const savedOrmEntity = await this.userOrmRepository.save(ormEntity);

      // Convert back ORM Entity → Domain Entity
      const savedUser = this.userMapper.toDomainEntity(savedOrmEntity);

      this.logger.info(
        this.i18n.t('success.user.saved', {
          userId: savedUser.id,
          email: savedUser.email.value,
        }),
        { operation: 'UserRepository.save', userId: savedUser.id },
      );

      return savedUser;
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.user.save_failed', {
          userId: user.id,
          error: (error as Error).message,
        }),
        error as Error,
        { operation: 'UserRepository.save', userId: user.id },
      );
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      this.logger.debug(
        this.i18n.t('operations.user.find_by_id_attempt', { userId: id }),
        { operation: 'UserRepository.findById', userId: id },
      );

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

      this.logger.debug(
        this.i18n.t('success.user.found', {
          userId: user.id,
          email: user.email.value,
        }),
        { operation: 'UserRepository.findById', userId: id },
      );

      return user;
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.user.find_failed', {
          userId: id,
          error: (error as Error).message,
        }),
        error as Error,
        { operation: 'UserRepository.findById', userId: id },
      );
      throw error;
    }
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      this.logger.debug(
        this.i18n.t('operations.user.find_by_email_attempt', {
          email: email.value,
        }),
        { operation: 'UserRepository.findByEmail', email: email.value },
      );

      const ormEntity = await this.userOrmRepository.findOne({
        where: { email: email.value.toLowerCase() },
      });

      if (!ormEntity) {
        this.logger.debug(
          this.i18n.t('info.user.not_found_by_email', { email: email.value }),
          { operation: 'UserRepository.findByEmail', email: email.value },
        );
        return null;
      }

      const user = this.userMapper.toDomainEntity(ormEntity);

      this.logger.debug(
        this.i18n.t('success.user.found_by_email', {
          userId: user.id,
          email: user.email.value,
        }),
        { operation: 'UserRepository.findByEmail', email: email.value },
      );

      return user;
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.user.find_by_email_failed', {
          email: email.value,
          error: (error as Error).message,
        }),
        error as Error,
        { operation: 'UserRepository.findByEmail', email: email.value },
      );
      throw error;
    }
  }

  async findAll(params?: UserQueryParams): Promise<PaginatedResult<User>> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const skip = (page - 1) * limit;

      this.logger.debug(
        this.i18n.t('operations.user.find_all_attempt', {
          page,
          limit,
        }),
        { operation: 'UserRepository.findAll', page, limit },
      );

      const [ormEntities, totalItems] =
        await this.userOrmRepository.findAndCount({
          order: { createdAt: 'DESC' },
          skip,
          take: limit,
        });

      const users = ormEntities.map((entity) =>
        this.userMapper.toDomainEntity(entity),
      );

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

      this.logger.info(
        this.i18n.t('success.user.found_paginated', {
          count: users.length,
          totalItems,
          page,
        }),
        { operation: 'UserRepository.findAll', page, limit, totalItems },
      );

      return result;
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.user.find_all_failed', {
          error: (error as Error).message,
        }),
        error as Error,
        { operation: 'UserRepository.findAll', params },
      );
      throw error;
    }
  }

  // Implémentations simplifiées pour les autres méthodes requises par l'interface
  async search(params: UserQueryParams): Promise<PaginatedResult<User>> {
    // Pour l'instant, déléguer à findAll
    return this.findAll(params);
  }

  async findByRole(
    role: UserRole,
    params?: UserQueryParams,
  ): Promise<PaginatedResult<User>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const [ormEntities, totalItems] = await this.userOrmRepository.findAndCount(
      {
        where: { role },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      },
    );

    const users = ormEntities.map((entity) =>
      this.userMapper.toDomainEntity(entity),
    );

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

  async update(user: User): Promise<User> {
    try {
      this.logger.info(
        this.i18n.t('operations.user.update_attempt', {
          userId: user.id,
          email: user.email.value,
        }),
        { operation: 'UserRepository.update', userId: user.id },
      );

      const ormEntity = this.userMapper.toOrmEntity(user);
      const savedOrmEntity = await this.userOrmRepository.save(ormEntity);
      const updatedUser = this.userMapper.toDomainEntity(savedOrmEntity);

      this.logger.info(
        this.i18n.t('success.user.updated', {
          userId: updatedUser.id,
          email: updatedUser.email.value,
        }),
        { operation: 'UserRepository.update', userId: user.id },
      );

      return updatedUser;
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.user.update_failed', {
          userId: user.id,
          error: (error as Error).message,
        }),
        error as Error,
        { operation: 'UserRepository.update', userId: user.id },
      );
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.info(
        this.i18n.t('operations.user.delete_attempt', { userId: id }),
        { operation: 'UserRepository.delete', userId: id },
      );

      const result = await this.userOrmRepository.delete(id);

      if (result.affected === 0) {
        throw new Error(this.i18n.t('errors.user.not_found', { userId: id }));
      }

      this.logger.info(this.i18n.t('success.user.deleted', { userId: id }), {
        operation: 'UserRepository.delete',
        userId: id,
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.user.delete_failed', {
          userId: id,
          error: (error as Error).message,
        }),
        error as Error,
        { operation: 'UserRepository.delete', userId: id },
      );
      throw error;
    }
  }

  async emailExists(email: Email): Promise<boolean> {
    const count = await this.userOrmRepository.count({
      where: { email: email.value.toLowerCase() },
    });

    return count > 0;
  }

  async countSuperAdmins(): Promise<number> {
    return await this.userOrmRepository.count({
      where: { role: UserRole.SUPER_ADMIN },
    });
  }

  async count(): Promise<number> {
    return await this.userOrmRepository.count();
  }

  async countWithFilters(params: UserQueryParams): Promise<number> {
    // Implémentation simplifiée
    return await this.userOrmRepository.count();
  }

  async updateBatch(users: User[]): Promise<User[]> {
    const ormEntities = users.map((user) => this.userMapper.toOrmEntity(user));
    const savedOrmEntities = await this.userOrmRepository.save(ormEntities);
    return savedOrmEntities.map((entity) =>
      this.userMapper.toDomainEntity(entity),
    );
  }

  async deleteBatch(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const result = await this.userOrmRepository.delete(ids);

    if (result.affected !== ids.length) {
      throw new Error(
        this.i18n.t('errors.user.batch_delete_failed', {
          expected: ids.length,
          deleted: result.affected,
        }),
      );
    }
  }

  async export(params?: UserQueryParams): Promise<User[]> {
    const ormEntities = await this.userOrmRepository.find({
      order: { createdAt: 'DESC' },
    });

    return ormEntities.map((entity) => this.userMapper.toDomainEntity(entity));
  }
}
