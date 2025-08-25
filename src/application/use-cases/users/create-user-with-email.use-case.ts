/**
 * 🎯 Create User with Email Use Case
 *
 * Extension du CreateUserUseCase avec support email automatique
 * Implémentation TDD GREEN PHASE
 */

import { UserRepository } from '../../../domain/repositories/user.repository';
import { IEmailService } from '../../ports/email.port';
import type { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';
import { IPasswordGenerator } from '../../ports/password-generator.port';
import {
  CreateUserRequest,
  CreateUserResponse,
  CreateUserUseCase,
} from './create-user.use-case';

export class CreateUserWithEmailUseCase extends CreateUserUseCase {
  constructor(
    userRepository: UserRepository,
    logger: Logger,
    i18n: I18nService,
    private readonly emailService: IEmailService,
    private readonly passwordGenerator: IPasswordGenerator,
  ) {
    super(userRepository, logger, i18n);
  }

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const startTime = Date.now();
    const requestContext = {
      operation: 'CreateUserWithEmail',
      requestingUserId: request.requestingUserId,
      targetEmail: request.email,
      targetRole: request.role,
    };

    this.logger.info(
      this.i18n.t('operations.user.creation_with_email_attempt'),
      requestContext,
    );

    try {
      // 1. Générer un mot de passe temporaire AVANT la création de l'utilisateur
      this.logger.debug(
        this.i18n.t('operations.password.generation_attempt'),
        requestContext,
      );

      const temporaryPassword =
        await this.passwordGenerator.generateTemporaryPassword();

      this.logger.audit(
        this.i18n.t('audit.password_generated'),
        request.requestingUserId,
        {
          targetEmail: request.email,
          passwordGenerated: true,
          timestamp: new Date().toISOString(),
        },
      );

      // 2. Créer l'utilisateur via le use case parent (inclut toutes les validations)
      const userCreationResult = await super.execute(request);

      // 3. Envoyer l'email de bienvenue avec le mot de passe temporaire
      try {
        await this.emailService.sendWelcomeEmail(
          userCreationResult.email,
          userCreationResult.name,
          temporaryPassword,
          this.generateLoginUrl(),
        );

        this.logger.audit(
          this.i18n.t('audit.welcome_email_sent'),
          request.requestingUserId,
          {
            targetUserId: userCreationResult.id,
            targetEmail: userCreationResult.email,
            emailDelivered: true,
            timestamp: new Date().toISOString(),
          },
        );

        this.logger.info(
          this.i18n.t('success.user.creation_with_email_success', {
            email: userCreationResult.email,
            userId: userCreationResult.id,
          }),
          { ...requestContext, userId: userCreationResult.id },
        );
      } catch (emailError) {
        // ⚠️ Email failure should NOT block user creation
        // We log a warning but let the user creation succeed
        this.logger.warn(
          this.i18n.t('warnings.email.delivery_failed', {
            email: userCreationResult.email,
            error: (emailError as Error).message,
          }),
          {
            ...requestContext,
            userId: userCreationResult.id,
            emailError: (emailError as Error).message,
          },
        );

        // Log audit trail for email failure
        this.logger.audit(
          this.i18n.t('audit.welcome_email_failed'),
          request.requestingUserId,
          {
            targetUserId: userCreationResult.id,
            targetEmail: userCreationResult.email,
            emailDelivered: false,
            errorMessage: (emailError as Error).message,
            timestamp: new Date().toISOString(),
          },
        );
      }

      const duration = Date.now() - startTime;
      this.logger.info(
        this.i18n.t('operations.completed', {
          operation: 'CreateUserWithEmail',
          duration: `${duration}ms`,
        }),
        { ...requestContext, duration },
      );

      return userCreationResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        this.i18n.t('operations.failed', { operation: 'CreateUserWithEmail' }),
        error as Error,
        { ...requestContext, duration },
      );
      throw error;
    }
  }

  /**
   * 🔗 Génère l'URL de connexion pour l'application
   * @private
   */
  private generateLoginUrl(): string {
    // Dans un environnement réel, ceci devrait venir de la configuration
    return process.env.APP_LOGIN_URL || 'https://app.company.com/login';
  }
}
