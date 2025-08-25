/**
 * 🎯 Create User Use Case - CLEAN ARCHITECTURE FIXED
 *
 * Use case respectant la Clean Architecture :
 * - Utilise les exceptions APPLICATION pour encapsuler les erreurs du domaine
 * - Ajoute le contexte applicatif approprié
 * - Gère l'orchestration des services externes
 */

import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { Permission, UserRole } from '../../../shared/enums/user-role.enum';
import {
    ApplicationAuthorizationError,
    ApplicationValidationError,
    ExternalServiceError,
    UseCaseExecutionError,
    WorkflowOrchestrationError,
} from '../../exceptions/application.exceptions';
import { IEmailService } from '../../ports/email.port';
import type { I18nService } from '../../ports/i18n.port';
import type { Logger } from '../../ports/logger.port';

// DTOs
export interface CreateUserWithProperExceptionsRequest {
  email: string;
  name: string;
  role: UserRole;
  requestingUserId: string;
  sendWelcomeEmail?: boolean;
}

export interface CreateUserWithProperExceptionsResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  emailSent: boolean;
}

/**
 * 🏗️ Use Case avec gestion CORRECTE des exceptions
 */
export class CreateUserWithProperExceptionsUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: IEmailService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: CreateUserWithProperExceptionsRequest,
  ): Promise<CreateUserWithProperExceptionsResponse> {
    const startTime = Date.now();
    const operationContext = {
      operation: 'CreateUserWithProperExceptions',
      requestingUserId: request.requestingUserId,
      targetEmail: request.email,
      correlationId: `create-user-${Date.now()}`,
    };

    this.logger.info(
      this.i18n.t('operations.user.creation_attempt'),
      operationContext,
    );

    try {
      // 🔍 1. Validation de l'utilisateur demandeur (Domain Logic → Application Exception)
      const requestingUser = await this.validateRequestingUser(
        request.requestingUserId,
        operationContext,
      );

      // 🛡️ 2. Vérification des permissions (Domain Logic → Application Exception)
      await this.validatePermissions(
        requestingUser,
        request.role,
        operationContext,
      );

      // 📝 3. Validation des données (Domain Logic → Application Exception)
      const validatedData = await this.validateUserData(
        request,
        operationContext,
      );

      // 🏗️ 4. Création de l'utilisateur (Domain Logic → Application Exception)
      const user = await this.createUser(validatedData, operationContext);

      // 📧 5. Envoi d'email optionnel (External Service → Application Exception)
      const emailSent = await this.sendWelcomeEmailIfRequested(
        user,
        request.sendWelcomeEmail,
        operationContext,
      );

      const duration = Date.now() - startTime;
      this.logger.info(this.i18n.t('success.user.created'), {
        ...operationContext,
        userId: user.id,
        duration,
      });

      return {
        id: user.id,
        email: user.email.value,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        emailSent,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // 🚨 Si c'est déjà une ApplicationException, on la propage
      if (
        error instanceof ApplicationAuthorizationError ||
        error instanceof ApplicationValidationError ||
        error instanceof ExternalServiceError ||
        error instanceof WorkflowOrchestrationError
      ) {
        this.logger.error(this.i18n.t('errors.user.creation_failed'), error, {
          ...operationContext,
          duration,
          errorType: error.constructor.name,
        });
        throw error;
      }

      // 🔄 Sinon, on encapsule l'erreur dans une UseCaseExecutionError
      const useCaseError = new UseCaseExecutionError(
        'CreateUserWithProperExceptions',
        `Unexpected error during user creation: ${(error as Error).message}`,
        error as Error,
      );

      this.logger.error(
        this.i18n.t('errors.user.creation_failed'),
        useCaseError,
        {
          ...operationContext,
          duration,
          originalError: (error as Error).message,
        },
      );

      throw useCaseError;
    }
  }

  /**
   * 🔍 Validation de l'utilisateur demandeur
   * Transform Domain Exception → Application Exception
   */
  private async validateRequestingUser(
    requestingUserId: string,
    context: Record<string, any>,
  ): Promise<User> {
    try {
      const requestingUser =
        await this.userRepository.findById(requestingUserId);

      if (!requestingUser) {
        // ❌ AVANT: throw new UserNotFoundError(requestingUserId);
        // ✅ APRÈS: Exception Application avec contexte
        throw new ApplicationAuthorizationError(
          'user-creation',
          'create-user',
          requestingUserId,
          'Requesting user not found',
        );
      }

      return requestingUser;
    } catch (error) {
      if (error instanceof ApplicationAuthorizationError) {
        throw error;
      }

      // Encapsulation d'erreurs inattendues
      throw new UseCaseExecutionError(
        'CreateUserWithProperExceptions',
        `Failed to validate requesting user: ${(error as Error).message}`,
        error as Error,
      );
    }
  }

  /**
   * 🛡️ Validation des permissions
   * Transform Domain Exception → Application Exception
   */
  private async validatePermissions(
    requestingUser: User,
    targetRole: UserRole,
    context: Record<string, any>,
  ): Promise<void> {
    try {
      // Logique métier du domaine
      if (!requestingUser.hasPermission(Permission.CREATE_USER)) {
        // ❌ AVANT: throw new InsufficientPermissionsError(...)
        // ✅ APRÈS: Exception Application avec contexte
        throw new ApplicationAuthorizationError(
          'user-creation',
          'create-user',
          requestingUser.id,
          `User lacks CREATE_USER permission`,
        );
      }

      if (
        targetRole === UserRole.SUPER_ADMIN &&
        requestingUser.role !== UserRole.SUPER_ADMIN
      ) {
        // ❌ AVANT: throw new RoleElevationError(...)
        // ✅ APRÈS: Exception Application avec contexte
        throw new ApplicationAuthorizationError(
          'user-creation',
          'create-super-admin',
          requestingUser.id,
          'Only SUPER_ADMIN can create SUPER_ADMIN users',
        );
      }
    } catch (error) {
      if (error instanceof ApplicationAuthorizationError) {
        throw error;
      }

      throw new UseCaseExecutionError(
        'CreateUserWithProperExceptions',
        `Permission validation failed: ${(error as Error).message}`,
        error as Error,
      );
    }
  }

  /**
   * 📝 Validation des données
   * Transform Domain Exception → Application Exception
   */
  private async validateUserData(
    request: CreateUserWithProperExceptionsRequest,
    context: Record<string, any>,
  ): Promise<{ email: Email; name: string; role: UserRole }> {
    try {
      // Validation de l'email (logique domaine)
      let email: Email;
      try {
        email = new Email(request.email.trim());
      } catch {
        // ❌ AVANT: throw new InvalidEmailFormatError(request.email)
        // ✅ APRÈS: Exception Application avec contexte
        throw new ApplicationValidationError(
          'email',
          request.email,
          'Invalid email format according to domain rules',
        );
      }

      // Validation du nom
      if (!request.name?.trim() || request.name.trim().length < 2) {
        // ❌ AVANT: throw new InvalidNameError(request.name)
        // ✅ APRÈS: Exception Application avec contexte
        throw new ApplicationValidationError(
          'name',
          request.name,
          'Name must be at least 2 characters long',
        );
      }

      // Vérification de l'unicité de l'email
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        // ❌ AVANT: throw new EmailAlreadyExistsError(email.value)
        // ✅ APRÈS: Exception Application avec contexte
        throw new ApplicationValidationError(
          'email',
          email.value,
          'Email address is already registered in the system',
        );
      }

      return {
        email,
        name: request.name.trim(),
        role: request.role,
      };
    } catch (error) {
      if (error instanceof ApplicationValidationError) {
        throw error;
      }

      throw new UseCaseExecutionError(
        'CreateUserWithProperExceptions',
        `Data validation failed: ${(error as Error).message}`,
        error as Error,
      );
    }
  }

  /**
   * 🏗️ Création de l'utilisateur
   */
  private async createUser(
    data: { email: Email; name: string; role: UserRole },
    context: Record<string, any>,
  ): Promise<User> {
    try {
      const user = User.create(data.email, data.name, data.role);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new UseCaseExecutionError(
        'CreateUserWithProperExceptions',
        `User creation failed during persistence: ${(error as Error).message}`,
        error as Error,
      );
    }
  }

  /**
   * 📧 Envoi d'email de bienvenue
   * External Service → Application Exception
   */
  private async sendWelcomeEmailIfRequested(
    user: User,
    shouldSendEmail: boolean | undefined,
    context: Record<string, any>,
  ): Promise<boolean> {
    if (!shouldSendEmail) {
      return false;
    }

    try {
      await this.emailService.sendWelcomeEmail(
        user.email.value,
        user.name,
        JSON.stringify({
          userId: user.id,
          loginUrl: 'https://app.example.com/login',
        }),
      );

      this.logger.info(this.i18n.t('success.email.welcome_sent'), {
        ...context,
        userId: user.id,
        email: user.email.value,
      });

      return true;
    } catch (error) {
      // ❌ AVANT: throw error directement
      // ✅ APRÈS: Exception Application pour service externe
      throw new ExternalServiceError(
        'EmailService',
        'sendWelcomeEmail',
        error as Error,
        1, // retry attempts
      );
    }
  }
}
