/**
 * 🗄️ CACHE EXCEPTIONS - Exceptions pour les opérations de cache
 */

import { ApplicationException } from './application.exceptions';

export class CacheException extends ApplicationException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CACHE_ERROR', 'errors.cache.general_error', context);
  }
}

export class CacheConnectionException extends CacheException {
  constructor(
    message: string = 'Failed to connect to cache service',
    context?: Record<string, unknown>,
  ) {
    super(message, context);
  }
}

export class CacheOperationException extends CacheException {
  constructor(operation: string, context?: Record<string, unknown>) {
    super(`Cache operation failed: ${operation}`, context);
  }
}

export class UserSessionException extends ApplicationException {
  constructor(message: string, context?: Record<string, unknown>) {
    super(
      message,
      'USER_SESSION_ERROR',
      'errors.session.general_error',
      context,
    );
  }
}

export class UserSessionNotFoundError extends UserSessionException {
  constructor(userId: string) {
    super(`User session not found for user: ${userId}`, { userId });
  }
}

export class UserSessionExpiredError extends UserSessionException {
  constructor(userId: string) {
    super(`User session expired for user: ${userId}`, { userId });
  }
}
