/**
 * 🧪 TESTS - Pino Logger Service
 *
 * Tests d'intégration pour le service de logging Pino
 * Validation de l'implémentation Clean Architecture
 */

import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import { Logger } from '../../application/ports/logger.port';
import { LOGGER_TOKEN } from './pino-logger.module';
import { PinoLoggerService } from './pino-logger.service';

describe('PinoLoggerService - Clean Architecture Integration', () => {
  let service: PinoLoggerService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          pinoHttp: {
            level: 'silent', // Pas de logs pendant les tests
          },
        }),
      ],
      providers: [
        PinoLoggerService,
        {
          provide: LOGGER_TOKEN,
          useClass: PinoLoggerService,
        },
      ],
    }).compile();

    service = module.get<PinoLoggerService>(PinoLoggerService);
    logger = module.get<Logger>(LOGGER_TOKEN);
  });

  describe('🏗️ Clean Architecture Compliance', () => {
    it('should implement Logger interface correctly', () => {
      expect(service).toBeDefined();
      expect(typeof service.info).toBe('function');
      expect(typeof service.debug).toBe('function');
      expect(typeof service.warn).toBe('function');
      expect(typeof service.error).toBe('function');
      expect(typeof service.audit).toBe('function');
      expect(typeof service.child).toBe('function');
    });

    it('should be injectable via Logger token', () => {
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(PinoLoggerService);
    });
  });

  describe('🌍 i18n & Context Integration', () => {
    it('should support structured logging with context', () => {
      // Test que les méthodes acceptent le contexte
      expect(() => {
        service.info('Test message', {
          operation: 'test',
          userId: 'user-123',
          correlationId: 'corr-456',
        });
      }).not.toThrow();
    });

    it('should support audit logging with user context', () => {
      expect(() => {
        service.audit('USER_LOGIN', 'user-123', {
          clientIp: '192.168.1.1',
          userAgent: 'Test Browser',
        });
      }).not.toThrow();
    });

    it('should create child loggers with inherited context', () => {
      const childLogger = service.child({
        operation: 'CreateUser',
        correlationId: 'corr-789',
      });

      expect(childLogger).toBeDefined();
      expect(typeof childLogger.info).toBe('function');
      expect(typeof childLogger.audit).toBe('function');
      expect(typeof childLogger.child).toBe('function');
    });
  });

  describe('🎯 Advanced Logging Features', () => {
    it('should support operation lifecycle logging', () => {
      expect(() => {
        service.startOperation('CreateUser', { userId: 'user-123' });
        service.endOperation('CreateUser', { userId: 'user-123' });
      }).not.toThrow();
    });

    it('should support performance logging', () => {
      expect(() => {
        service.performance('DatabaseQuery', 150, {
          query: 'SELECT * FROM users',
        });
      }).not.toThrow();
    });

    it('should handle operation failures', () => {
      const error = new Error('Database connection failed');

      expect(() => {
        service.failOperation('CreateUser', error, { userId: 'user-123' });
      }).not.toThrow();
    });
  });

  describe('🔄 Repository Integration', () => {
    it('should demonstrate usage in repository context', () => {
      // Simulation d'usage dans notre TypeORM Repository
      const repositoryLogger = service.child({
        component: 'TypeOrmUserRepository',
        operation: 'save',
      });

      // Messages typiques du repository
      expect(() => {
        repositoryLogger.info(
          "Tentative de sauvegarde de l'utilisateur user-123",
          {
            userId: 'user-123',
            email: 'test@example.com',
          },
        );

        repositoryLogger.info('Utilisateur user-123 sauvegardé avec succès', {
          userId: 'user-123',
          email: 'test@example.com',
        });

        repositoryLogger.audit('USER_CREATED', 'admin-456', {
          targetUserId: 'user-123',
          targetEmail: 'test@example.com',
        });
      }).not.toThrow();
    });
  });

  describe('⚠️ Error Handling', () => {
    it('should handle errors with full context', () => {
      const error = new Error('Test error with stack trace');

      expect(() => {
        service.error('Operation failed', error, {
          operation: 'TestOperation',
          userId: 'user-123',
          correlationId: 'corr-456',
        });
      }).not.toThrow();
    });

    it('should handle errors without context', () => {
      expect(() => {
        service.error('Simple error message');
      }).not.toThrow();
    });
  });
});
