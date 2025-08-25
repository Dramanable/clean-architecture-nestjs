/**
 * 🏗️ INFRASTRUCTURE - Pino Logger Module
 *
 * Configuration NestJS pour l'intégration Pino
 * Logging structuré pour la Clean Architecture
 */

import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { TOKENS } from '../../shared/constants/injection-tokens';
import { pinoConfig } from './pino-logger.config';
import { PinoLoggerService } from './pino-logger.service';

@Global()
@Module({
  imports: [LoggerModule.forRoot(pinoConfig)],
  providers: [
    PinoLoggerService,
    {
      provide: TOKENS.LOGGER,
      useClass: PinoLoggerService,
    },
  ],
  exports: [TOKENS.LOGGER, PinoLoggerService],
})
export class PinoLoggerModule {}
