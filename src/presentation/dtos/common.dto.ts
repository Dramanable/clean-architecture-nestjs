import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

/**
 * 📋 DTO - Pagination Query Parameters
 *
 * DTO pour les paramètres de pagination dans les requêtes
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  limit?: number = 10;
}

/**
 * 📋 DTO - API Error Response
 *
 * DTO standardisé pour les réponses d'erreur
 */
export class ApiErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed',
  })
  message!: string;

  @ApiProperty({
    description: 'Detailed error information',
    example: ['email must be a valid email'],
    type: [String],
    required: false,
  })
  details?: string[];

  @ApiProperty({
    description: 'Error code for client handling',
    example: 'VALIDATION_ERROR',
    required: false,
  })
  code?: string;

  @ApiProperty({
    description: 'Timestamp of the error',
    example: '2024-01-15T10:00:00.000Z',
    format: 'date-time',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Request path that caused the error',
    example: '/api/users',
  })
  path!: string;
}

/**
 * 📋 DTO - API Success Response
 *
 * DTO standardisé pour les réponses de succès simples
 */
export class ApiSuccessResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully',
  })
  message!: string;

  @ApiProperty({
    description: 'Timestamp of the operation',
    example: '2024-01-15T10:00:00.000Z',
    format: 'date-time',
  })
  timestamp!: string;
}
