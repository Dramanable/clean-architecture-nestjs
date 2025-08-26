/**
 * 🏢 DOMAIN SERVICE - User Onboarding
 *
 * Encapsule la logique métier complexe d'onboarding d'utilisateurs
 * Coordonne password generation + email delivery + audit
 */

import { IEmailService } from '../../application/ports/email.port';
import type { I18nService } from '../../application/ports/i18n.port';
import { Logger } from '../../application/ports/logger.port';
import { IPasswordGenerator } from '../../application/ports/password-generator.port';

export interface OnboardingContext {
  userId: string;
  userName: string;
  userEmail: string;
  requestingUserId: string;
}

export interface OnboardingResult {
  temporaryPassword: string;
  emailSent: boolean;
  auditEvents: string[];
}

export class UserOnboardingService {
  constructor(
    private readonly emailService: IEmailService,
    private readonly passwordGenerator: IPasswordGenerator,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  /**
   * 🚀 Processus d'onboarding complet
   * Génère password + envoie email + audit trail
   */
  async processUserOnboarding(
    context: OnboardingContext,
  ): Promise<OnboardingResult> {
    const auditEvents: string[] = [];

    try {
      // 1. Génération sécurisée du mot de passe
      const temporaryPassword = await this.generateSecurePassword(context);
      auditEvents.push('password_generated');

      // 2. Envoi de l'email (graceful failure)
      const emailSent = await this.sendWelcomeEmailSafely(
        context,
        temporaryPassword,
      );
      auditEvents.push(emailSent ? 'email_sent' : 'email_failed');

      // 3. Audit trail consolidé
      this.auditOnboardingProcess(context, emailSent, auditEvents);

      return {
        temporaryPassword,
        emailSent,
        auditEvents,
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('domain.onboarding.process_failed'),
        error as Error,
        { context, auditEvents },
      );
      throw error;
    }
  }

  /**
   * 🔐 Génération sécurisée avec audit
   */
  private async generateSecurePassword(
    context: OnboardingContext,
  ): Promise<string> {
    this.logger.debug(
      this.i18n.t('domain.onboarding.password_generation'),
      context,
    );

    const password = await this.passwordGenerator.generateTemporaryPassword();

    this.logger.audit(
      this.i18n.t('audit.password_generated'),
      context.requestingUserId,
      {
        targetUserId: context.userId,
        targetEmail: context.userEmail,
        timestamp: new Date().toISOString(),
      },
    );

    return password;
  }

  /**
   * 📧 Envoi d'email avec gestion gracieuse des erreurs
   */
  private async sendWelcomeEmailSafely(
    context: OnboardingContext,
    temporaryPassword: string,
  ): Promise<boolean> {
    try {
      await this.emailService.sendWelcomeEmail(
        context.userEmail,
        context.userName,
        temporaryPassword,
        this.generateLoginUrl(),
      );

      this.logger.audit(
        this.i18n.t('audit.welcome_email_sent'),
        context.requestingUserId,
        {
          targetUserId: context.userId,
          targetEmail: context.userEmail,
          emailDelivered: true,
          timestamp: new Date().toISOString(),
        },
      );

      return true;
    } catch (emailError) {
      this.logger.warn(
        this.i18n.t('warnings.email.delivery_failed', {
          email: context.userEmail,
          error: (emailError as Error).message,
        }),
        {
          context,
          emailError: (emailError as Error).message,
        },
      );

      this.logger.audit(
        this.i18n.t('audit.welcome_email_failed'),
        context.requestingUserId,
        {
          targetUserId: context.userId,
          targetEmail: context.userEmail,
          emailDelivered: false,
          errorMessage: (emailError as Error).message,
          timestamp: new Date().toISOString(),
        },
      );

      return false;
    }
  }

  /**
   * 📊 Audit trail consolidé
   */
  private auditOnboardingProcess(
    context: OnboardingContext,
    emailSent: boolean,
    auditEvents: string[],
  ): void {
    this.logger.audit(
      this.i18n.t('audit.user_onboarding_completed'),
      context.requestingUserId,
      {
        targetUserId: context.userId,
        targetEmail: context.userEmail,
        emailDelivered: emailSent,
        processSteps: auditEvents,
        completedAt: new Date().toISOString(),
      },
    );
  }

  private generateLoginUrl(): string {
    return process.env.APP_LOGIN_URL || 'https://app.company.com/login';
  }
}
