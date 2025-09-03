/**
 * 🔐 AUTH DTOs - Clean Architecture with Swagger Documentation
 *
 * DTOs d'authentification avec validation et documentation Swagger
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * DTO pour la requête de login
 */
export class LoginDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}

/**
 * DTO pour la requête de refresh token
 */
export class RefreshTokenDto {
  @ApiPropertyOptional({
    description: 'Refresh token (can be provided via cookie or body)',
    example: 'refresh_token_string',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsOptional()
  refreshToken?: string;
}

/**
 * DTO pour la requête de logout
 */
export class LogoutDto {
  @ApiPropertyOptional({
    description: 'Logout from all devices',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'Logout all must be a boolean' })
  @IsOptional()
  logoutAll?: boolean;
}

/**
 * DTO pour la réponse de login
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'Login success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'user-123',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'USER',
    },
  })
  user!: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * DTO pour la réponse de refresh token
 */
export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Refresh success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'user-123',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'USER',
    },
  })
  user!: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * DTO pour la réponse de logout
 */
export class LogoutResponseDto {
  @ApiProperty({
    description: 'Logout success status',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Logout confirmation message',
    example: 'Successfully logged out',
  })
  message!: string;
}

/**
 * DTO pour la réponse d'informations utilisateur
 */
export class UserInfoResponseDto {
  @ApiProperty({
    description: 'User information',
    example: {
      id: 'user-123',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'USER',
    },
  })
  user!: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * DTO pour la réponse clean de login (auth-clean.controller)
 */
export class LoginCleanResponseDto {
  @ApiProperty({
    description: 'User information',
    example: {
      id: 'user-123',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'USER',
    },
  })
  user!: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
