/**
 * 📋 SEARCH DTO - Simple DTO for search users endpoint
 */

import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../shared/enums/user-role.enum';

export class SearchUsersSimpleDto {
  @ApiProperty({
    description: 'Search term for name and email',
    required: false,
    example: 'john',
  })
  searchTerm?: string;

  @ApiProperty({
    description: 'Filter by user roles',
    required: false,
    enum: UserRole,
    isArray: true,
    example: [UserRole.USER, UserRole.MANAGER],
  })
  roles?: UserRole[];

  @ApiProperty({
    description: 'Filter by active status',
    required: false,
    example: true,
  })
  isActive?: boolean;

  @ApiProperty({
    description: 'Filter users created after this date',
    required: false,
    example: '2023-01-01T00:00:00Z',
  })
  createdAfter?: string;

  @ApiProperty({
    description: 'Filter users created before this date',
    required: false,
    example: '2023-12-31T23:59:59Z',
  })
  createdBefore?: string;

  @ApiProperty({
    description: 'Page number (1-based)',
    required: false,
    minimum: 1,
    default: 1,
    example: 1,
  })
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  limit?: number;

  @ApiProperty({
    description: 'Sort field',
    required: false,
    default: 'createdAt',
    example: 'name',
  })
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'asc',
  })
  sortOrder?: 'asc' | 'desc';
}
