import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Param,
    Post
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ApiErrorResponseDto } from '../dtos/common.dto';
import {
    PasswordResetConfirmDto,
    PasswordResetRequestDto,
    PasswordResetResponseDto,
    TokenValidationResponseDto,
} from '../dtos/password-reset.dto';
import { PasswordResetMapper } from '../mappers/password-reset.mapper';

/**
 * 🔐 PRESENTATION LAYER - Password Reset Controller with Swagger
 *
 * Contrôleur pour les opérations de réinitialisation de mot de passe
 * avec documentation OpenAPI complète
 */
@ApiTags('password-reset')
@Controller('password-reset')
export class PasswordResetController {
  @Post('initiate')
  @ApiOperation({
    summary: 'Initiate password reset',
    description: 'Sends a password reset email to the user if the email exists',
  })
  @ApiBody({
    type: PasswordResetRequestDto,
    description: 'Email address for password reset',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Password reset email sent (always returns success for security)',
    type: PasswordResetResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid email format',
    type: ApiErrorResponseDto,
  })
  initiatePasswordReset(
    @Body() request: PasswordResetRequestDto,
  ): Promise<PasswordResetResponseDto> {
    // TODO: Appeler le service password reset
    return Promise.resolve(
      PasswordResetMapper.toResponseDto(
        true,
        'Password reset email sent successfully',
      ),
    );
  }

  @Get('validate/:token')
  @ApiOperation({
    summary: 'Validate password reset token',
    description: 'Checks if a password reset token is valid and not expired',
  })
  @ApiParam({
    name: 'token',
    description: 'Password reset token to validate',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token validation result',
    type: TokenValidationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Token not found or expired',
    type: ApiErrorResponseDto,
  })
  validateToken(
    @Param('token') token: string,
  ): Promise<TokenValidationResponseDto> {
    // TODO: Valider le token
    return Promise.resolve({
      isValid: true,
      token: token,
      message: 'Token is valid',
      timestamp: new Date().toISOString(),
    });
  }

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm password reset',
    description: 'Sets new password using a valid reset token',
  })
  @ApiBody({
    type: PasswordResetConfirmDto,
    description: 'Token and new password for confirmation',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully',
    type: PasswordResetResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid token or weak password',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.GONE,
    description: 'Token expired',
    type: ApiErrorResponseDto,
  })
  confirmPasswordReset(
    @Body() request: PasswordResetConfirmDto,
  ): Promise<PasswordResetResponseDto> {
    // TODO: Appeler le service password reset pour confirmation
    return Promise.resolve(
      PasswordResetMapper.toResponseDto(
        true,
        `Password reset completed successfully for token: ${request.token}`,
      ),
    );
  }
}
