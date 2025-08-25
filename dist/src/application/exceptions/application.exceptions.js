"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyInjectionError = exports.ApplicationAuthorizationError = exports.ApplicationValidationError = exports.ExternalServiceError = exports.UseCaseExecutionError = exports.WorkflowOrchestrationError = exports.ServiceConfigurationError = exports.EmailServiceUnavailableError = exports.PasswordGenerationError = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    code;
    i18nKey;
    context;
    constructor(message, code, i18nKey, context) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.i18nKey = i18nKey;
        this.context = context;
    }
}
exports.ApplicationException = ApplicationException;
class PasswordGenerationError extends ApplicationException {
    constructor(reason, context) {
        super(`Password generation failed: ${reason}`, 'PASSWORD_GENERATION_FAILED', 'errors.application.password_generation_failed', context);
    }
}
exports.PasswordGenerationError = PasswordGenerationError;
class EmailServiceUnavailableError extends ApplicationException {
    constructor(serviceName, error) {
        super(`Email service ${serviceName} is unavailable: ${error.message}`, 'EMAIL_SERVICE_UNAVAILABLE', 'errors.application.email_service_unavailable', { serviceName, originalError: error.message });
    }
}
exports.EmailServiceUnavailableError = EmailServiceUnavailableError;
class ServiceConfigurationError extends ApplicationException {
    constructor(serviceName, missingConfig) {
        super(`Service ${serviceName} is misconfigured. Missing: ${missingConfig.join(', ')}`, 'SERVICE_CONFIGURATION_ERROR', 'errors.application.service_configuration_error', { serviceName, missingConfig });
    }
}
exports.ServiceConfigurationError = ServiceConfigurationError;
class WorkflowOrchestrationError extends ApplicationException {
    constructor(workflowName, step, reason, context) {
        super(`Workflow ${workflowName} failed at step ${step}: ${reason}`, 'WORKFLOW_ORCHESTRATION_ERROR', 'errors.application.workflow_orchestration_error', { workflowName, step, reason, ...context });
    }
}
exports.WorkflowOrchestrationError = WorkflowOrchestrationError;
class UseCaseExecutionError extends ApplicationException {
    constructor(useCaseName, reason, originalError) {
        super(`UseCase ${useCaseName} execution failed: ${reason}`, 'USE_CASE_EXECUTION_ERROR', 'errors.application.use_case_execution_error', {
            useCaseName,
            reason,
            originalError: originalError?.message,
            stack: originalError?.stack,
        });
    }
}
exports.UseCaseExecutionError = UseCaseExecutionError;
class ExternalServiceError extends ApplicationException {
    constructor(serviceName, operation, error, retryAttempts) {
        super(`External service ${serviceName} failed during ${operation}: ${error.message}`, 'EXTERNAL_SERVICE_ERROR', 'errors.application.external_service_error', {
            serviceName,
            operation,
            originalError: error.message,
            retryAttempts: retryAttempts ?? 0,
        });
    }
}
exports.ExternalServiceError = ExternalServiceError;
class ApplicationValidationError extends ApplicationException {
    constructor(field, value, rule) {
        super(`Application validation failed for field ${field} with value ${value}: ${rule}`, 'APPLICATION_VALIDATION_ERROR', 'errors.application.validation_error', { field, value: String(value), rule });
    }
}
exports.ApplicationValidationError = ApplicationValidationError;
class ApplicationAuthorizationError extends ApplicationException {
    constructor(resource, action, userId, reason) {
        super(`Application authorization failed: user ${userId} cannot ${action} on ${resource}${reason ? `: ${reason}` : ''}`, 'APPLICATION_AUTHORIZATION_ERROR', 'errors.application.authorization_error', { resource, action, userId, reason });
    }
}
exports.ApplicationAuthorizationError = ApplicationAuthorizationError;
class DependencyInjectionError extends ApplicationException {
    constructor(dependencyName, reason) {
        super(`Dependency injection failed for ${dependencyName}: ${reason}`, 'DEPENDENCY_INJECTION_ERROR', 'errors.application.dependency_injection_error', { dependencyName, reason });
    }
}
exports.DependencyInjectionError = DependencyInjectionError;
//# sourceMappingURL=application.exceptions.js.map