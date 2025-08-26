/**
 * 🧪 TEST CONTROLLER - Pour les tests et démonstrations
 *
 * Controller temporaire pour tester Swagger et créer des utilisateurs de test
 */

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dtos/auth.dto';

@ApiTags('test')
@Controller('test')
export class TestController {
  /**
   * 🧪 TEST LOGIN - Pour tester Swagger
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test login endpoint',
    description: 'Test endpoint to verify Swagger input functionality',
  })
  @ApiResponse({
    status: 200,
    description: 'Test successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Test successful' },
        receivedData: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  testLogin(@Body() loginDto: LoginDto): {
    message: string;
    receivedData: unknown;
  } {
    return {
      message: 'Test endpoint working! Data received successfully.',
      receivedData: {
        email: loginDto.email,
        hasPassword: !!loginDto.password,
        passwordLength: loginDto.password?.length || 0,
        rememberMe: loginDto.rememberMe,
      },
    };
  }

  /**
   * 🧪 SIMPLE PING - Test sans paramètres
   */
  @Post('ping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Simple ping test',
    description: 'Simple test endpoint without parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'Pong response',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'pong' },
        timestamp: { type: 'string', example: '2025-08-25T14:33:17.878Z' },
      },
    },
  })
  ping(): { message: string; timestamp: string } {
    return {
      message: 'pong',
      timestamp: new Date().toISOString(),
    };
  }
}
