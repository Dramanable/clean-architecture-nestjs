/**
 * 🏗️ INFRASTRUCTURE - TypeORM User Repository (Minimal)
 */

import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { PaginatedResult } from '../../../shared/types/pagination.types';
import { UserQueryParams } from '../../../shared/types/user-query.types';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  
  async save(user: User): Promise<User> {
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return null;
  }

  async delete(id: string): Promise<void> {
    // Mock implementation
  }

  async findAll(params?: UserQueryParams): Promise<PaginatedResult<User>> {
    return {
      data: [],
      meta: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 10, hasNextPage: false, hasPreviousPage: false },
    };
  }

  async search(params: UserQueryParams): Promise<PaginatedResult<User>> {
    return this.findAll(params);
  }

  async findByRole(role: UserRole, params?: UserQueryParams): Promise<PaginatedResult<User>> {
    return this.findAll(params);
  }

  async emailExists(email: Email): Promise<boolean> {
    return false;
  }

  async countSuperAdmins(): Promise<number> {
    return 0;
  }

  async count(): Promise<number> {
    return 0;
  }

  async countWithFilters(params: UserQueryParams): Promise<number> {
    return 0;
  }

  async update(user: User): Promise<User> {
    return user;
  }

  async updateBatch(users: User[]): Promise<User[]> {
    return users;
  }

  async deleteBatch(ids: string[]): Promise<void> {
    // Mock implementation
  }

  async export(params?: UserQueryParams): Promise<User[]> {
    return [];
  }
}
