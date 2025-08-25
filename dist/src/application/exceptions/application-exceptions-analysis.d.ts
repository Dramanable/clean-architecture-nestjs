export declare class ApplicationExceptionsAnalysis {
    static getCorrectExceptionMappings(): {
        UserNotFoundError: string;
        InsufficientPermissionsError: string;
        InvalidEmailFormatError: string;
        EmailAlreadyExistsError: string;
        RoleElevationError: string;
        EmailServiceError: string;
        DatabaseConnectionError: string;
        ThirdPartyApiError: string;
        UnexpectedError: string;
        TypeError: string;
        ReferenceError: string;
    };
    static getBenefits(): {
        separationOfConcerns: {
            description: string;
            domain: string;
            application: string;
            presentation: string;
        };
        enrichedContext: {
            description: string;
            fields: string[];
        };
        consistentI18n: {
            description: string;
            structure: {
                code: string;
                i18nKey: string;
                context: {
                    resource: string;
                    action: string;
                };
            };
        };
        enhancedSecurity: {
            description: string;
            benefits: string[];
        };
        betterTestability: {
            description: string;
            advantages: string[];
        };
    };
    static getMigrationPlan(): {
        phase1: {
            title: string;
            tasks: string[];
        };
        phase2: {
            title: string;
            tasks: string[];
        };
        phase3: {
            title: string;
            tasks: string[];
        };
        phase4: {
            title: string;
            tasks: string[];
        };
    };
}
