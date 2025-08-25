/**
 * 🎯 STRATEGY PATTERN - Onboarding Strategies
 *
 * Différentes stratégies d'onboarding selon le contexte
 * Reste dans la couche Application
 */

import { IEmailService } from '../ports/email.port';
import type { I18nService } from '../ports/i18n.port';
import { Logger } from '../ports/logger.port';
import { IPasswordGenerator } from '../ports/password-generator.port';
import {
    CreateUserRequest,
    CreateUserResponse,
} from '../use-cases/users/create-user.use-case';

export interface OnboardingStrategy {
  execute(
    user: CreateUserResponse,
    request: CreateUserRequest,
  ): Promise<OnboardingResult>;
}

export interface OnboardingResult {
  emailSent: boolean;
  passwordGenerated: boolean;
  auditEvents: string[];
}

/**
 * 📧 Stratégie : Onboarding avec email
 */
export class EmailOnboardingStrategy implements OnboardingStrategy {
  constructor(
    private readonly emailService: IEmailService,
    private readonly passwordGenerator: IPasswordGenerator,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    user: CreateUserResponse,
    request: CreateUserRequest,
  ): Promise<OnboardingResult> {
    const auditEvents: string[] = [];

    // 1. Génération du mot de passe
    const password = await this.passwordGenerator.generateTemporaryPassword();
    auditEvents.push('password_generated');

    this.logger.audit(
      this.i18n.t('audit.password_generated'),
      request.requestingUserId,
      { targetUserId: user.id, targetEmail: user.email },
    );

    // 2. Envoi de l'email
    let emailSent = false;
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.name,
        password,
        'https://app.company.com/login',
      );
      emailSent = true;
      auditEvents.push('email_sent');

      this.logger.audit(
        this.i18n.t('audit.welcome_email_sent'),
        request.requestingUserId,
        {
          targetUserId: user.id,
          targetEmail: user.email,
          emailDelivered: true,
        },
      );
    } catch (error) {
      auditEvents.push('email_failed');
      this.logger.warn(this.i18n.t('warnings.email.delivery_failed'), {
        targetUserId: user.id,
        error: (error as Error).message,
      });
    }

    return {
      emailSent,
      passwordGenerated: true,
      auditEvents,
    };
  }
}

/**
 * 📋 Stratégie : Onboarding manuel (pas d'email)
 */
export class ManualOnboardingStrategy implements OnboardingStrategy {
  constructor(
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  execute(
    user: CreateUserResponse,
    request: CreateUserRequest,
  ): Promise<OnboardingResult> {
    this.logger.audit(
      this.i18n.t('audit.manual_onboarding'),
      request.requestingUserId,
      { targetUserId: user.id, targetEmail: user.email },
    );

    return Promise.resolve({
      emailSent: false,
      passwordGenerated: false,
      auditEvents: ['manual_onboarding'],
    });
  }
}

/**
 * 🎯 Context utilisant les stratégies
 */
export class OnboardingContext {
  constructor(private strategy: OnboardingStrategy) {}

  setStrategy(strategy: OnboardingStrategy): void {
    this.strategy = strategy;
  }

  async executeOnboarding(
    user: CreateUserResponse,
    request: CreateUserRequest,
  ): Promise<OnboardingResult> {
    return await this.strategy.execute(user, request);
  }
}

/**
 * 🏭 Factory pour les stratégies d'onboarding
 */
export class OnboardingStrategyFactory {
  static createEmailStrategy(
    emailService: IEmailService,
    passwordGenerator: IPasswordGenerator,
    logger: Logger,
    i18n: I18nService,
  ): EmailOnboardingStrategy {
    return new EmailOnboardingStrategy(
      emailService,
      passwordGenerator,
      logger,
      i18n,
    );
  }

  static createManualStrategy(
    logger: Logger,
    i18n: I18nService,
  ): ManualOnboardingStrategy {
    return new ManualOnboardingStrategy(logger, i18n);
  }
}
