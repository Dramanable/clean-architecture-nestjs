/**
 * 📝 EXAMPLE - Utilisation du User Onboarding Application Service
 *
 * Exemple concret d'utilisation respectant la Clean Architecture
 * Montre comment composer et utiliser le service d'application
 */

import { UserRole } from '../../shared/enums/user-role.enum';
import { CreateUserUseCase } from '../use-cases/users/create-user.use-case';
import { UserOnboardingApplicationService } from './user-onboarding.application-service';

/**
 * 🎯 Exemple d'usage simple dans un controller ou handler
 */
export class UserOnboardingExample {
  constructor(
    private readonly onboardingService: UserOnboardingApplicationService,
  ) {}

  /**
   * 📧 Création d'utilisateur avec email automatique
   */
  async createUserWithEmail() {
    const result = await this.onboardingService.createUserWithOnboarding({
      email: 'john.doe@company.com',
      name: 'John Doe',
      role: UserRole.USER,
      requestingUserId: 'admin-123',
      sendWelcomeEmail: true, // Email automatique
    });

    console.log('✅ Utilisateur créé:', result.email);
    console.log('📧 Email envoyé:', result.onboardingStatus.emailSent);
    console.log(
      '🔐 Password généré:',
      result.onboardingStatus.passwordGenerated,
    );
    console.log('📊 Audit events:', result.onboardingStatus.auditEvents);

    return result;
  }

  /**
   * 👤 Création d'utilisateur sans email (manuel)
   */
  async createUserManually() {
    const result = await this.onboardingService.createUserWithOnboarding({
      email: 'manager@company.com',
      name: 'Team Manager',
      role: UserRole.MANAGER,
      requestingUserId: 'admin-123',
      sendWelcomeEmail: false, // Pas d'email
    });

    console.log('✅ Utilisateur créé:', result.email);
    console.log('📋 Onboarding manuel:', !result.onboardingStatus.emailSent);

    return result;
  }

  /**
   * 🚨 Gestion des erreurs gracieuse
   */
  async handleErrors() {
    try {
      const result = await this.onboardingService.createUserWithOnboarding({
        email: 'test@company.com',
        name: 'Test User',
        role: UserRole.USER,
        requestingUserId: 'admin-123',
        sendWelcomeEmail: true,
      });

      // Si l'email échoue, l'utilisateur est quand même créé
      if (!result.onboardingStatus.emailSent) {
        console.log('⚠️ Utilisateur créé mais email a échoué');
        console.log("📞 Contacter l'utilisateur manuellement");
      }

      return result;
    } catch (error) {
      console.error('❌ Échec complet de la création:', error);
      throw error;
    }
  }
}

/**
 * 🏭 Factory pour créer le service avec toutes ses dépendances
 * (Dans un vrai projet, ceci serait géré par l'injection de dépendances)
 */
export class UserOnboardingServiceFactory {
  static create(
    userRepository: any,
    emailService: any,
    passwordGenerator: any,
    logger: any,
    i18n: any,
  ): UserOnboardingApplicationService {
    // 1. Créer le use case de création d'utilisateur
    const createUserUseCase = new CreateUserUseCase(
      userRepository,
      logger,
      i18n,
    );

    // 2. Créer le service d'application qui orchestre tout
    return new UserOnboardingApplicationService(
      createUserUseCase,
      emailService,
      passwordGenerator,
      logger,
      i18n,
    );
  }
}

/**
 * 🎯 Avantages de cette approche:
 *
 * ✅ CLEAN ARCHITECTURE:
 * - Le service reste dans la couche Application
 * - Pas de dépendance Domain → Application
 * - Ports et adapters respectés
 *
 * ✅ SINGLE RESPONSIBILITY:
 * - Le service orchestre uniquement
 * - Le use case gère la création d'utilisateur
 * - Les ports gèrent les services externes
 *
 * ✅ TESTABILITÉ:
 * - Chaque composant testable indépendamment
 * - Mocks faciles à créer
 * - Tests d'intégration possibles
 *
 * ✅ MAINTAINABILITÉ:
 * - Logique business centralisée
 * - Gestion d'erreurs cohérente
 * - Audit trail complet
 *
 * ✅ EXTENSIBILITÉ:
 * - Facile d'ajouter de nouveaux types d'onboarding
 * - Facile de modifier les workflows
 * - Facile d'ajouter de nouveaux services
 */
