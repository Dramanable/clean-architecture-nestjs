import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * 📋 DTO - Password Reset Request
 *
 * DTO pour initier une demande de réinitialisation de mot de passe
 */
export class PasswordResetRequestDto {
  @ApiProperty({
    description: 'Email address of the user requesting password reset',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string;
}

/**
 * 📋 DTO - Password Reset Confirmation
 *
 * DTO pour confirmer la réinitialisation avec le nouveau mot de passe
 */
export class PasswordResetConfirmDto {
  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'abcd1234-5678-9012-3456-789012345678',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  @Transform(({ value }: { value: string }) => value?.trim())
  token: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'NewSecurePassword123!',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;
}

/**
 * 📋 DTO - Password Reset Response
 *
 * DTO pour les réponses des opérations de password reset
 */
export class PasswordResetResponseDto {
  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Success or error message',
    example: 'Password reset email sent successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp of the operation',
    example: '2024-01-15T10:00:00.000Z',
    format: 'date-time',
  })
  timestamp: string;
}

/**
 * 📋 DTO - Token Validation Response
 *
 * DTO pour la validation de token
 */
export class TokenValidationResponseDto {
  @ApiProperty({
    description: 'Whether the token is valid',
    example: true,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Error message if token is invalid',
    example: 'Token expired',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'Timestamp of the validation',
    example: '2024-01-15T10:00:00.000Z',
    format: 'date-time',
  })
  timestamp: string;
}
