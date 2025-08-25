"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinoLoggerService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
let PinoLoggerService = class PinoLoggerService {
    pinoLogger;
    constructor(pinoLogger) {
        this.pinoLogger = pinoLogger;
    }
    info(message, context) {
        this.pinoLogger.info(context || {}, message);
    }
    debug(message, context) {
        this.pinoLogger.debug(context || {}, message);
    }
    warn(message, context) {
        this.pinoLogger.warn(context || {}, message);
    }
    error(message, error, context) {
        const errorContext = {
            ...context,
            ...(error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                },
            }),
        };
        this.pinoLogger.error(errorContext, message);
    }
    log(level, message, context) {
        switch (level) {
            case 'info':
                this.info(message, context);
                break;
            case 'debug':
                this.debug(message, context);
                break;
            case 'warn':
                this.warn(message, context);
                break;
            case 'error':
                this.error(message, undefined, context);
                break;
        }
    }
    logWithOperation(level, message, operation, additionalContext) {
        const enrichedContext = {
            operation,
            timestamp: new Date().toISOString(),
            ...additionalContext,
        };
        this.log(level, message, enrichedContext);
    }
    audit(action, userId, context) {
        const auditContext = {
            ...context,
            type: 'AUDIT',
            action,
            userId,
            timestamp: new Date().toISOString(),
        };
        this.info(`🔍 AUDIT: ${action} by user ${userId}`, auditContext);
    }
    child(context) {
        const childLogger = this.pinoLogger.logger.child(context);
        return {
            info: (message, additionalContext) => {
                childLogger.info({ ...additionalContext }, message);
            },
            debug: (message, additionalContext) => {
                childLogger.debug({ ...additionalContext }, message);
            },
            warn: (message, additionalContext) => {
                childLogger.warn({ ...additionalContext }, message);
            },
            error: (message, error, additionalContext) => {
                const errorContext = {
                    ...additionalContext,
                    ...(error && {
                        error: {
                            name: error.name,
                            message: error.message,
                            stack: error.stack,
                        },
                    }),
                };
                childLogger.error(errorContext, message);
            },
            audit: (action, userId, additionalContext) => {
                const auditContext = {
                    ...additionalContext,
                    type: 'AUDIT',
                    action,
                    userId,
                    timestamp: new Date().toISOString(),
                };
                childLogger.info(auditContext, `🔍 AUDIT: ${action} by user ${userId}`);
            },
            child: (nestedContext) => {
                return this.child({ ...context, ...nestedContext });
            },
        };
    }
    performance(operation, duration, context) {
        const perfContext = {
            ...context,
            type: 'PERFORMANCE',
            operation,
            duration,
            unit: 'ms',
            timestamp: new Date().toISOString(),
        };
        this.info(`⏱️ Operation ${operation} completed in ${duration}ms`, perfContext);
    }
    startOperation(operation, context) {
        const startContext = {
            ...context,
            operation,
            phase: 'START',
            timestamp: new Date().toISOString(),
        };
        this.info(`🚀 Starting operation: ${operation}`, startContext);
    }
    endOperation(operation, context) {
        const endContext = {
            ...context,
            operation,
            phase: 'END',
            status: 'SUCCESS',
            timestamp: new Date().toISOString(),
        };
        this.info(`✅ Operation completed: ${operation}`, endContext);
    }
    failOperation(operation, error, context) {
        const failContext = {
            ...context,
            operation,
            phase: 'END',
            status: 'FAILURE',
            timestamp: new Date().toISOString(),
        };
        this.error(`💥 Operation failed: ${operation}`, error, failContext);
    }
};
exports.PinoLoggerService = PinoLoggerService;
exports.PinoLoggerService = PinoLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(nestjs_pino_1.PinoLogger)),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger])
], PinoLoggerService);
//# sourceMappingURL=pino-logger.service.js.map