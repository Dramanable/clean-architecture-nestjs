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
var ConsoleLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLoggerService = void 0;
const common_1 = require("@nestjs/common");
let ConsoleLoggerService = ConsoleLoggerService_1 = class ConsoleLoggerService {
    nestLogger = new common_1.Logger(ConsoleLoggerService_1.name);
    defaultContext = {};
    constructor(defaultContext) {
        if (defaultContext) {
            this.defaultContext = defaultContext;
        }
    }
    info(message, context) {
        const formattedMessage = this.formatMessage(message, context);
        this.nestLogger.log(formattedMessage);
    }
    debug(message, context) {
        const formattedMessage = this.formatMessage(message, context);
        this.nestLogger.debug(formattedMessage);
    }
    warn(message, context) {
        const formattedMessage = this.formatMessage(message, context);
        this.nestLogger.warn(formattedMessage);
    }
    error(message, error, context) {
        const formattedMessage = this.formatMessage(message, context);
        if (error) {
            this.nestLogger.error(formattedMessage, error.stack);
        }
        else {
            this.nestLogger.error(formattedMessage);
        }
    }
    audit(action, userId, context) {
        const auditContext = {
            ...context,
            action,
            userId,
            timestamp: new Date().toISOString(),
            type: 'AUDIT',
        };
        const message = `AUDIT: ${action} by user ${userId}`;
        this.info(message, auditContext);
    }
    child(context) {
        const childContext = { ...this.defaultContext, ...context };
        return new ConsoleLoggerService_1(childContext);
    }
    formatMessage(message, context) {
        const fullContext = { ...this.defaultContext, ...context };
        if (Object.keys(fullContext).length === 0) {
            return message;
        }
        const contextParts = Object.entries(fullContext)
            .map(([key, value]) => `${key}=${value}`)
            .join(' | ');
        return `${message} | ${contextParts}`;
    }
};
exports.ConsoleLoggerService = ConsoleLoggerService;
exports.ConsoleLoggerService = ConsoleLoggerService = ConsoleLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], ConsoleLoggerService);
//# sourceMappingURL=console-logger.service.js.map