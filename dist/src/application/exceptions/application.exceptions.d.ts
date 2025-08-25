export declare abstract class ApplicationException extends Error {
    readonly code: string;
    readonly i18nKey: string;
    readonly context?: Record<string, any>;
    constructor(message: string, code: string, i18nKey: string, context?: Record<string, any>);
}
export declare class PasswordGenerationError extends ApplicationException {
    constructor(reason: string, context?: Record<string, any>);
}
export declare class EmailServiceUnavailableError extends ApplicationException {
    constructor(serviceName: string, error: Error);
}
export declare class ServiceConfigurationError extends ApplicationException {
    constructor(serviceName: string, missingConfig: string[]);
}
export declare class WorkflowOrchestrationError extends ApplicationException {
    constructor(workflowName: string, step: string, reason: string, context?: Record<string, any>);
}
export declare class UseCaseExecutionError extends ApplicationException {
    constructor(useCaseName: string, reason: string, originalError?: Error);
}
export declare class ExternalServiceError extends ApplicationException {
    constructor(serviceName: string, operation: string, error: Error, retryAttempts?: number);
}
export declare class ApplicationValidationError extends ApplicationException {
    constructor(field: string, value: any, rule: string);
}
export declare class ApplicationAuthorizationError extends ApplicationException {
    constructor(resource: string, action: string, userId: string, reason?: string);
}
export declare class DependencyInjectionError extends ApplicationException {
    constructor(dependencyName: string, reason: string);
}
