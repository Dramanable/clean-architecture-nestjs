/**
 * 💊 Health Controller - Simple endpoint pour vérifier l'état de l'application
 */

import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../infrastructure/security/public.decorator';

@Controller()
@Public() // Tout le contrôleur est public
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Clean Architecture NestJS',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      version: '1.0.0-dev',
    };
  }

  @Get()
  getRoot() {
    return {
      message: '🚀 Clean Architecture NestJS API',
      version: '1.0.0-dev',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      endpoints: {
        health: '/health',
        auth: '/auth',
        users: '/users',
        docs: '/docs',
      },
    };
  }
}
