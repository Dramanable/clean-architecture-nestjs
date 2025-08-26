/**
 * 🚨 APPLICATION EXCEPTIONS
 *
 * Exceptions spécifiques à la couche Application
 * Gèrent les erreurs d'orchestration et de services
 */

export abstract class ApplicationException extends Error {
  public readonly code: string;
  public readonly i18nKey: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code?: string,
    i18nKey?: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code || 'APPLICATION_ERROR';
    this.i18nKey = i18nKey || 'errors.application.general_error';
    this.context = context;
  }
}

/**
 * 🔐 Exception : Échec de génération de mot de passe
 */
export class PasswordGenerationError extends ApplicationException {
  constructor(reason: string, context?: Record<string, any>) {
    super(
      `Password generation failed: ${reason}`,
      'PASSWORD_GENERATION_FAILED',
      'errors.application.password_generation_failed',
      context,
    );
  }
}

/**
 * 📧 Exception : Service d'email indisponible (critique)
 */
export class EmailServiceUnavailableError extends ApplicationException {
  constructor(serviceName: string, error: Error) {
    super(
      `Email service ${serviceName} is unavailable: ${error.message}`,
      'EMAIL_SERVICE_UNAVAILABLE',
      'errors.application.email_service_unavailable',
      { serviceName, originalError: error.message },
    );
  }
}

/**
 * 📋 Exception : Configuration du service d'application invalide
 */
export class ServiceConfigurationError extends ApplicationException {
  constructor(serviceName: string, missingConfig: string[]) {
    super(
      `Service ${serviceName} is misconfigured. Missing: ${missingConfig.join(', ')}`,
      'SERVICE_CONFIGURATION_ERROR',
      'errors.application.service_configuration_error',
      { serviceName, missingConfig },
    );
  }
}

/**
 * 🔄 Exception : Échec d'orchestration de workflow
 */
export class WorkflowOrchestrationError extends ApplicationException {
  constructor(
    workflowName: string,
    step: string,
    reason: string,
    context?: Record<string, any>,
  ) {
    super(
      `Workflow ${workflowName} failed at step ${step}: ${reason}`,
      'WORKFLOW_ORCHESTRATION_ERROR',
      'errors.application.workflow_orchestration_error',
      { workflowName, step, reason, ...context },
    );
  }
}

/**
 * 🎯 Exception : Use Case non trouvé ou invalide
 */
export class UseCaseExecutionError extends ApplicationException {
  constructor(useCaseName: string, reason: string, originalError?: Error) {
    super(
      `UseCase ${useCaseName} execution failed: ${reason}`,
      'USE_CASE_EXECUTION_ERROR',
      'errors.application.use_case_execution_error',
      {
        useCaseName,
        reason,
        originalError: originalError?.message,
        stack: originalError?.stack,
      },
    );
  }
}

/**
 * 🌐 Exception : Externe service timeout ou indisponible
 */
export class ExternalServiceError extends ApplicationException {
  constructor(
    serviceName: string,
    operation: string,
    error: Error,
    retryAttempts?: number,
  ) {
    super(
      `External service ${serviceName} failed during ${operation}: ${error.message}`,
      'EXTERNAL_SERVICE_ERROR',
      'errors.application.external_service_error',
      {
        serviceName,
        operation,
        originalError: error.message,
        retryAttempts: retryAttempts ?? 0,
      },
    );
  }
}

/**
 * 📊 Exception : Validation des données d'application
 */
export class ApplicationValidationError extends ApplicationException {
  constructor(field: string, value: any, rule: string) {
    super(
      `Application validation failed for field ${field} with value ${value}: ${rule}`,
      'APPLICATION_VALIDATION_ERROR',
      'errors.application.validation_error',
      { field, value: String(value), rule },
    );
  }
}

/**
 * 🔒 Exception : Autorisation au niveau application
 */
export class ApplicationAuthorizationError extends ApplicationException {
  constructor(
    resource: string,
    action: string,
    userId: string,
    reason?: string,
  ) {
    super(
      `Application authorization failed: user ${userId} cannot ${action} on ${resource}${reason ? `: ${reason}` : ''}`,
      'APPLICATION_AUTHORIZATION_ERROR',
      'errors.application.authorization_error',
      { resource, action, userId, reason },
    );
  }
}

/**
 * 🎨 Exception : Dépendance manquante ou invalide
 */
export class DependencyInjectionError extends ApplicationException {
  constructor(dependencyName: string, reason: string) {
    super(
      `Dependency injection failed for ${dependencyName}: ${reason}`,
      'DEPENDENCY_INJECTION_ERROR',
      'errors.application.dependency_injection_error',
      { dependencyName, reason },
    );
  }
}
