/**
 * 🏗️ INFRASTRUCTURE - Pino Logger Configuration
 *
 * Configuration du logger Pino pour NestJS avec support i18n
 * Logging structuré haute performance avec contexte d'application
 */

import { Request } from 'express';
import { Params } from 'nestjs-pino';

export const pinoConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL || 'info',

    // 🎨 Pretty printing en développement
    transport:
      process.env.NODE_ENV !== 'production'
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

    // 🏷️ Formatage personnalisé pour les logs
    formatters: {
      level: (label: string) => ({ level: label }),

      // 📋 Format des logs avec contexte Clean Architecture
      log: (object: any) => {
        const {
          operation,
          correlationId,
          operationId,
          userId,
          requestingUserId,
          clientIp,
          userAgent,
          email,
          ...rest
        } = object;

        return {
          ...rest,
          // 🎯 Contexte d'opération
          ...(operation && { operation }),
          ...(correlationId && { correlationId }),
          ...(operationId && { operationId }),

          // 👤 Contexte utilisateur
          ...(userId && { userId }),
          ...(requestingUserId && { requestingUserId }),
          ...(email && { email }),

          // 🌐 Contexte client
          ...(clientIp && { clientIp }),
          ...(userAgent && { userAgent }),

          // 📅 Timestamp ISO
          timestamp: new Date().toISOString(),
        };
      },
    },

    // 🔍 Customisation des logs de requêtes HTTP
    customLogLevel: (req: Request, res: any, err?: Error) => {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return 'silent';
      }
      return 'info';
    },

    // 📝 Enrichissement automatique des logs de requêtes
    customReceivedMessage: (req: Request) => {
      return `🔗 ${req.method} ${req.url}`;
    },

    customSuccessMessage: (req: Request, res: any) => {
      return `✅ ${req.method} ${req.url} - ${res.statusCode}`;
    },

    customErrorMessage: (req: Request, res: any, err: Error) => {
      return `❌ ${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
    },

    // 🎯 Ajout du correlationId aux logs de requêtes
    customAttributeKeys: {
      req: 'request',
      res: 'response',
      err: 'error',
      responseTime: 'duration',
    },

    // 🔧 Configuration de base
    base: {
      pid: false, // Pas besoin du PID en dev
    },

    // 🚫 Exclusion de certaines routes (health checks, etc.)
    autoLogging: {
      ignore: (req: Request) => {
        return (
          req.url === '/health' ||
          req.url === '/metrics' ||
          req.url?.startsWith('/swagger')
        );
      },
    },

    // 🌍 Support de la redirection des logs
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
