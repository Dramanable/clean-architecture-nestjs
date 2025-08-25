"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinoConfig = void 0;
exports.pinoConfig = {
    pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport: process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                    ignore: 'pid,hostname,req,res',
                    messageFormat: '🚀 {operation} | {correlationId} | {msg}',
                    errorLikeObjectKeys: ['err', 'error'],
                    singleLine: false,
                },
            }
            : undefined,
        formatters: {
            level: (label) => ({ level: label }),
            log: (object) => {
                const { operation, correlationId, operationId, userId, requestingUserId, clientIp, userAgent, email, ...rest } = object;
                return {
                    ...rest,
                    ...(operation && { operation }),
                    ...(correlationId && { correlationId }),
                    ...(operationId && { operationId }),
                    ...(userId && { userId }),
                    ...(requestingUserId && { requestingUserId }),
                    ...(email && { email }),
                    ...(clientIp && { clientIp }),
                    ...(userAgent && { userAgent }),
                    timestamp: new Date().toISOString(),
                };
            },
        },
        customLogLevel: (req, res, err) => {
            if (res.statusCode >= 400 && res.statusCode < 500) {
                return 'warn';
            }
            else if (res.statusCode >= 500 || err) {
                return 'error';
            }
            else if (res.statusCode >= 300 && res.statusCode < 400) {
                return 'silent';
            }
            return 'info';
        },
        customReceivedMessage: (req) => {
            return `🔗 ${req.method} ${req.url}`;
        },
        customSuccessMessage: (req, res) => {
            return `✅ ${req.method} ${req.url} - ${res.statusCode}`;
        },
        customErrorMessage: (req, res, err) => {
            return `❌ ${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
        },
        customAttributeKeys: {
            req: 'request',
            res: 'response',
            err: 'error',
            responseTime: 'duration',
        },
        base: {
            pid: false,
        },
        autoLogging: {
            ignore: (req) => {
                return (req.url === '/health' ||
                    req.url === '/metrics' ||
                    req.url?.startsWith('/swagger'));
            },
        },
        redact: {
            paths: [
                'request.headers.authorization',
                'request.headers.cookie',
                'response.headers["set-cookie"]',
                'password',
                'hashedPassword',
                'token',
                'accessToken',
                'refreshToken',
            ],
            censor: '[REDACTED]',
        },
    },
};
//# sourceMappingURL=pino-logger.config.js.map