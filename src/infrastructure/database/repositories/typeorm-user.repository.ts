/**
 * 🏗️ INFRASTRUCTURE - TypeORM User Repository
 */

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { PaginatedResult } from '../../../shared/types/pagination.types';
import { UserQueryParams } from '../../../shared/types/user-query.types';
import { UserOrmEntity } from '../entities/typeorm/user.entity';
import { UserMapper } from '../mappers/typeorm-user.mapper';
import { TOKENS } from '../../../shared/constants/injection-tokens';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepository: Repository<UserOrmEntity>,
    @Inject(TOKENS.USER_MAPPER)
    private readonly mapper: UserMapper,
  ) {}

  async save(user: User): Promise<User> {
    const ormEntity = this.mapper.toOrmEntity(user);
    const savedEntity = await this.ormRepository.save(ormEntity);
    return this.mapper.toDomainEntity(savedEntity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.ormRepository.findOne({ where: { id } });
    return entity ? this.mapper.toDomainEntity(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.ormRepository.findOne({
      where: { email: email.value },
    });
    return entity ? this.mapper.toDomainEntity(entity) : null;
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  async findAll(params?: UserQueryParams): Promise<PaginatedResult<User>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const [entities, totalItems] = await this.ormRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const users = entities.map((entity) => this.mapper.toDomainEntity(entity));
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: users,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async search(params: UserQueryParams): Promise<PaginatedResult<User>> {
    return this.findAll(params);
  }

  async findByRole(
    role: UserRole,
    params?: UserQueryParams,
  ): Promise<PaginatedResult<User>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const skip = (page - 1) * limit;

    const [entities, totalItems] = await this.ormRepository.findAndCount({
      where: { role },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const users = entities.map((entity) => this.mapper.toDomainEntity(entity));
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: users,
      meta: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async emailExists(email: Email): Promise<boolean> {
    const count = await this.ormRepository.count({
      where: { email: email.value },
    });
    return count > 0;
  }

  async countSuperAdmins(): Promise<number> {
    return await this.ormRepository.count({
      where: { role: UserRole.SUPER_ADMIN },
    });
  }

  async count(): Promise<number> {
    return await this.ormRepository.count();
  }

  async countWithFilters(params: UserQueryParams): Promise<number> {
    const whereConditions: any = {};
    if (params.filters?.role) {
      whereConditions.role = params.filters.role;
    }
    if (params.filters?.isActive !== undefined) {
      whereConditions.isActive = params.filters.isActive;
    }
    return await this.ormRepository.count({ where: whereConditions });
  }

  async update(user: User): Promise<User> {
    const ormEntity = this.mapper.toOrmEntity(user);
    const savedEntity = await this.ormRepository.save(ormEntity);
    return this.mapper.toDomainEntity(savedEntity);
  }

  async updateBatch(users: User[]): Promise<User[]> {
    const ormEntities = users.map((user) => this.mapper.toOrmEntity(user));
    const savedEntities = await this.ormRepository.save(ormEntities);
    return savedEntities.map((entity) => this.mapper.toDomainEntity(entity));
  }

  async deleteBatch(ids: string[]): Promise<void> {
    await this.ormRepository.delete(ids);
  }

  async export(params?: UserQueryParams): Promise<User[]> {
    const entities = await this.ormRepository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.mapper.toDomainEntity(entity));
  }
}
