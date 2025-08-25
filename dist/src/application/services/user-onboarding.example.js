"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserOnboardingServiceFactory = exports.UserOnboardingExample = void 0;
const user_role_enum_1 = require("../../shared/enums/user-role.enum");
const create_user_use_case_1 = require("../use-cases/users/create-user.use-case");
const user_onboarding_application_service_1 = require("./user-onboarding.application-service");
class UserOnboardingExample {
    onboardingService;
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    async createUserWithEmail() {
        const result = await this.onboardingService.createUserWithOnboarding({
            email: 'john.doe@company.com',
            name: 'John Doe',
            role: user_role_enum_1.UserRole.USER,
            requestingUserId: 'admin-123',
            sendWelcomeEmail: true,
        });
        console.log('✅ Utilisateur créé:', result.email);
        console.log('📧 Email envoyé:', result.onboardingStatus.emailSent);
        console.log('🔐 Password généré:', result.onboardingStatus.passwordGenerated);
        console.log('📊 Audit events:', result.onboardingStatus.auditEvents);
        return result;
    }
    async createUserManually() {
        const result = await this.onboardingService.createUserWithOnboarding({
            email: 'manager@company.com',
            name: 'Team Manager',
            role: user_role_enum_1.UserRole.MANAGER,
            requestingUserId: 'admin-123',
            sendWelcomeEmail: false,
        });
        console.log('✅ Utilisateur créé:', result.email);
        console.log('📋 Onboarding manuel:', !result.onboardingStatus.emailSent);
        return result;
    }
    async handleErrors() {
        try {
            const result = await this.onboardingService.createUserWithOnboarding({
                email: 'test@company.com',
                name: 'Test User',
                role: user_role_enum_1.UserRole.USER,
                requestingUserId: 'admin-123',
                sendWelcomeEmail: true,
            });
            if (!result.onboardingStatus.emailSent) {
                console.log('⚠️ Utilisateur créé mais email a échoué');
                console.log("📞 Contacter l'utilisateur manuellement");
            }
            return result;
        }
        catch (error) {
            console.error('❌ Échec complet de la création:', error);
            throw error;
        }
    }
}
exports.UserOnboardingExample = UserOnboardingExample;
class UserOnboardingServiceFactory {
    static create(userRepository, emailService, passwordGenerator, logger, i18n) {
        const createUserUseCase = new create_user_use_case_1.CreateUserUseCase(userRepository, logger, i18n);
        return new user_onboarding_application_service_1.UserOnboardingApplicationService(createUserUseCase, emailService, passwordGenerator, logger, i18n);
    }
}
exports.UserOnboardingServiceFactory = UserOnboardingServiceFactory;
//# sourceMappingURL=user-onboarding.example.js.map