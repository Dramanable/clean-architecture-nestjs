import { UserOnboardingApplicationService } from './user-onboarding.application-service';
export declare class UserOnboardingExample {
    private readonly onboardingService;
    constructor(onboardingService: UserOnboardingApplicationService);
    createUserWithEmail(): Promise<import("./user-onboarding.application-service").UserOnboardingResponse>;
    createUserManually(): Promise<import("./user-onboarding.application-service").UserOnboardingResponse>;
    handleErrors(): Promise<import("./user-onboarding.application-service").UserOnboardingResponse>;
}
export declare class UserOnboardingServiceFactory {
    static create(userRepository: any, emailService: any, passwordGenerator: any, logger: any, i18n: any): UserOnboardingApplicationService;
}
