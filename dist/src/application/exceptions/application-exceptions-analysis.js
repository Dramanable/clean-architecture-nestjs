"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationExceptionsAnalysis = void 0;
class ApplicationExceptionsAnalysis {
    static getCorrectExceptionMappings() {
        return {
            UserNotFoundError: 'ApplicationAuthorizationError',
            InsufficientPermissionsError: 'ApplicationAuthorizationError',
            InvalidEmailFormatError: 'ApplicationValidationError',
            EmailAlreadyExistsError: 'ApplicationValidationError',
            RoleElevationError: 'ApplicationAuthorizationError',
            EmailServiceError: 'ExternalServiceError',
            DatabaseConnectionError: 'ExternalServiceError',
            ThirdPartyApiError: 'ExternalServiceError',
            UnexpectedError: 'UseCaseExecutionError',
            TypeError: 'UseCaseExecutionError',
            ReferenceError: 'UseCaseExecutionError',
        };
    }
    static getBenefits() {
        return {
            separationOfConcerns: {
                description: 'Chaque couche a sa responsabilité claire',
                domain: 'Règles métier pures',
                application: 'Orchestration + contexte applicatif',
                presentation: 'Mapping HTTP approprié',
            },
            enrichedContext: {
                description: 'Informations riches pour debugging et audit',
                fields: [
                    'correlationId',
                    'operation',
                    'requestingUserId',
                    'timestamp',
                    'retryAttempts',
                ],
            },
            consistentI18n: {
                description: "Messages d'erreur localisables et standardisés",
                structure: {
                    code: 'APPLICATION_AUTHORIZATION_ERROR',
                    i18nKey: 'errors.application.authorization_error',
                    context: { resource: 'user-creation', action: 'create-user' },
                },
            },
            enhancedSecurity: {
                description: 'Contrôle fin des informations exposées',
                benefits: [
                    "Pas d'exposition des détails internes",
                    'Logs sécurisés avec contexte approprié',
                    "Messages d'erreur sanitisés",
                ],
            },
            betterTestability: {
                description: 'Tests plus robustes et prévisibles',
                advantages: [
                    'Exceptions prévisibles et typées',
                    'Mocking plus facile des erreurs',
                    "Tests d'intégration robustes",
                    'Validation du contexte applicatif',
                ],
            },
        };
    }
    static getMigrationPlan() {
        return {
            phase1: {
                title: 'Audit des Use Cases existants',
                tasks: [
                    'Identifier tous les endroits qui lancent des exceptions domaine',
                    'Cartographier les exceptions utilisées par use case',
                    'Analyser les besoins en contexte applicatif',
                ],
            },
            phase2: {
                title: 'Création des wrappers Application',
                tasks: [
                    "Implémenter les méthodes de transformation d'exceptions",
                    'Ajouter le contexte applicatif approprié',
                    'Standardiser les clés i18n',
                ],
            },
            phase3: {
                title: 'Migration progressive des Use Cases',
                tasks: [
                    'Migrer un use case à la fois',
                    'Maintenir la compatibilité arrière temporairement',
                    'Mettre à jour les tests associés',
                ],
            },
            phase4: {
                title: 'Mise à jour de la couche Présentation',
                tasks: [
                    'Adapter les controllers pour les nouvelles exceptions',
                    'Implémenter le mapping HTTP approprié',
                    'Mettre à jour la documentation API',
                ],
            },
        };
    }
}
exports.ApplicationExceptionsAnalysis = ApplicationExceptionsAnalysis;
//# sourceMappingURL=application-exceptions-analysis.js.map