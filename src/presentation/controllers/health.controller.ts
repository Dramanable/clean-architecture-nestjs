/**
 * 💊 Health Controller - Simple endpoint pour vérifier l'état de l'application
 */

import { Controller, Get } from '@nestjs/common';
import { Public } from '../../infrastructure/security/public.decorator';

@Controller()
@Public() // Tout le contrôleur est public
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Clean Architecture NestJS',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0-dev',
    };
  }

  @Get()
  getRoot() {
    return {
      message: '🚀 Clean Architecture NestJS API',
      version: '1.0.0-dev',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        health: '/health',
        auth: '/auth',
        users: '/users',
        docs: '/docs',
      },
    };
  }
}
