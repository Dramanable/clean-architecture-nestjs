import { PinoLogger } from 'nestjs-pino';
import { Logger } from '../../application/ports/logger.port';
export declare class PinoLoggerService implements Logger {
    private readonly pinoLogger;
    constructor(pinoLogger: PinoLogger);
    info(message: string, context?: Record<string, any>): void;
    debug(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, error?: Error, context?: Record<string, any>): void;
    log(level: 'info' | 'debug' | 'warn' | 'error', message: string, context?: Record<string, any>): void;
    logWithOperation(level: 'info' | 'debug' | 'warn' | 'error', message: string, operation: string, additionalContext?: Record<string, any>): void;
    audit(action: string, userId: string, context?: Record<string, any>): void;
    child(context: Record<string, any>): Logger;
    performance(operation: string, duration: number, context?: Record<string, any>): void;
    startOperation(operation: string, context?: Record<string, any>): void;
    endOperation(operation: string, context?: Record<string, any>): void;
    failOperation(operation: string, error: Error, context?: Record<string, any>): void;
}
