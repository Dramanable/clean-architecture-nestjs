import { Logger } from '../../application/ports/logger.port';
export declare class ConsoleLoggerService implements Logger {
    private readonly nestLogger;
    private readonly defaultContext;
    constructor(defaultContext?: Record<string, any>);
    info(message: string, context?: Record<string, any>): void;
    debug(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, error?: Error, context?: Record<string, any>): void;
    audit(action: string, userId: string, context?: Record<string, any>): void;
    child(context: Record<string, any>): Logger;
    private formatMessage;
}
