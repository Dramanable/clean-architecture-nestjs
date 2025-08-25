/**
 * 🧪 Module de test minimal pour AuthController
 */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
})
export class AuthTestModule {}
