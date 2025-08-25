/**
 * 🎯 APPLICATION SERVICE - User Onboarding Orchestrator
 *
 * Service d'application qui orchestre plusieurs use cases
 * Respecte la Clean Architecture - reste dans la couche Application
 */

import {
  ExternalServiceError,
  PasswordGenerationError,
  WorkflowOrchestrationError,
} from '../exceptions/application.exceptions';
import { IEmailService } from '../ports/email.port';
import type { I18nService } from '../ports/i18n.port';
import { Logger } from '../ports/logger.port';
import { IPasswordGenerator } from '../ports/password-generator.port';
import {
  CreateUserRequest,
  CreateUserResponse,
  CreateUserUseCase,
} from '../use-cases/users/create-user.use-case';

export interface UserOnboardingRequest extends CreateUserRequest {
  sendWelcomeEmail?: boolean; // Optionnel pour flexibilité
  password?: string; // Ajout du password pour l'orchestration
}

export interface UserOnboardingResponse extends CreateUserResponse {
  onboardingStatus: {
    passwordGenerated: boolean;
    emailSent: boolean;
    auditEvents: string[];
  };
}

/**
 * � APPLICATION SERVICE - User Onboarding Orchestrator
 *
 * Service d'application qui orchestre plusieurs use cases
 * Respecte la Clean Architecture - reste dans la couche Application
 */

export class UserOnboardingApplicationService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly emailService: IEmailService,
    private readonly passwordGenerator: IPasswordGenerator,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  /**
   * 🚀 Orchestre l'onboarding complet d'un utilisateur
   * 1. Génération du mot de passe temporaire
   * 2. Création de l'utilisateur (délégué au Use Case)
   * 3. Envoi de l'email de bienvenue (graceful failure)
   */
  async createUserWithOnboarding(
    request: UserOnboardingRequest,
  ): Promise<UserOnboardingResponse> {
    this.logger.info(
      this.i18n.t('operations.user.onboarding_started', {
        email: request.email,
      }),
      {
        requestingUserId: request.requestingUserId,
        targetEmail: request.email,
        sendEmail: request.sendWelcomeEmail ?? true,
      },
    );

    try {
      // ✅ ÉTAPE 1: Création de l'utilisateur (délégué au Use Case métier)
      const userResult = await this.createUserUseCase.execute(request);

      // ✅ ÉTAPE 2: Génération du password temporaire (seulement si email requis ET user créé)
      let temporaryPassword: string | undefined;
      if (request.sendWelcomeEmail !== false) {
        temporaryPassword = await this.generateTemporaryPassword(
          userResult,
          request.requestingUserId,
        );
      }

      // ✅ ÉTAPE 3: Email de bienvenue (optionnel et graceful)
      let emailSent = false;

      if (request.sendWelcomeEmail && temporaryPassword) {
        emailSent = await this.sendWelcomeEmail(
          {
            id: userResult.id,
            email: userResult.email,
            name: userResult.name,
          },
          temporaryPassword,
          request.requestingUserId,
        );
      }

      // ✅ SUCCÈS: Audit trail complet
      const auditEvents = ['user_created'];

      if (request.sendWelcomeEmail !== false) {
        auditEvents.push(
          temporaryPassword ? 'password_generated' : 'no_password_needed',
        );
        auditEvents.push(emailSent ? 'email_sent' : 'email_failed');
      }

      this.logger.info(
        this.i18n.t('success.user.onboarding_completed', {
          userId: userResult.id,
          email: userResult.email,
        }),
        {
          userId: userResult.id,
          emailSent,
          auditEvents,
        },
      );

      // ✅ Audit trail final du processus complet
      this.logger.audit(
        this.i18n.t('audit.user_onboarding_process'),
        request.requestingUserId,
        {
          targetUserId: userResult.id,
          targetEmail: userResult.email,
          passwordGenerated: !!temporaryPassword,
          emailSent,
          processSteps: auditEvents,
          completedAt: new Date().toISOString(),
        },
      );

      return {
        ...userResult,
        onboardingStatus: {
          passwordGenerated: !!temporaryPassword,
          emailSent,
          auditEvents,
        },
      };
    } catch (error) {
      // ❌ ÉCHEC: Gestion centralisée avec contexte complet
      const orchestrationError = new WorkflowOrchestrationError(
        'UserOnboarding',
        'execute',
        (error as Error).message,
      );

      this.logger.error(
        this.i18n.t('errors.user.onboarding_failed', {
          email: request.email,
          error: orchestrationError.message,
        }),
        orchestrationError,
        {
          requestingUserId: request.requestingUserId,
          targetEmail: request.email,
          errorCode: orchestrationError.code,
        },
      );

      throw orchestrationError;
    }
  }

  /**
   * 🔐 Génère un mot de passe temporaire sécurisé
   */
  private async generateTemporaryPassword(
    user: CreateUserResponse,
    requestingUserId: string,
  ): Promise<string> {
    try {
      const password = await this.passwordGenerator.generateTemporaryPassword();

      this.logger.audit(
        this.i18n.t('audit.password_generated'),
        requestingUserId,
        {
          targetUserId: user.id,
          targetEmail: user.email,
          timestamp: new Date().toISOString(),
        },
      );

      return password;
    } catch (error) {
      throw new PasswordGenerationError((error as Error).message);
    }
  }

  /**
   * 📧 Envoie l'email de bienvenue (graceful failure)
   * L'échec de l'email ne doit PAS faire échouer l'onboarding
   */
  private async sendWelcomeEmail(
    user: { id: string; email: string; name: string },
    temporaryPassword: string,
    requestingUserId: string,
  ): Promise<boolean> {
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.name,
        temporaryPassword,
        this.generateLoginUrl(),
      );

      this.logger.info(
        this.i18n.t('success.email.welcome_sent', {
          email: user.email,
        }),
        {
          targetUserId: user.id,
        },
      );

      this.logger.audit(
        this.i18n.t('audit.welcome_email_sent'),
        requestingUserId,
        {
          targetUserId: user.id,
          targetEmail: user.email,
          emailDelivered: true,
          timestamp: new Date().toISOString(),
        },
      );

      return true;
    } catch (emailError) {
      // ⚠️ Email failure ne doit PAS faire échouer l'onboarding
      // Mais on peut créer une exception spécifique pour le contexte
      const serviceError = new ExternalServiceError(
        'EmailService',
        'sendWelcomeEmail',
        emailError as Error,
      );

      this.logger.warn(
        this.i18n.t('warnings.email.delivery_failed', {
          email: user.email,
          error: serviceError.message,
        }),
        {
          targetUserId: user.id,
          emailError: serviceError.message,
          serviceErrorCode: serviceError.code,
        },
      );

      return false;
    }
  }

  private generateLoginUrl(): string {
    return process.env.APP_LOGIN_URL || 'https://app.company.com/login';
  }
}
