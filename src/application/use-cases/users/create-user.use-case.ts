/**
 * 🎯 Create User Use Case
 *
 * Règles métier pour la création d'utilisateurs avec logging et i18n
 */

import { User } from '../../../domain/entities/user.entity';
import {
  EmailAlreadyExistsError,
  InsufficientPermissionsError,
  InvalidEmailFormatError,
  InvalidNameError,
  RoleElevationError,
  UserNotFoundError,
} from '../../../domain/exceptions/user.exceptions';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { Email } from '../../../domain/value-objects/email.vo';
import { Permission, UserRole } from '../../../shared/enums/user-role.enum';
import type { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';

// DTOs
export interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
  requestingUserId: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export class CreateUserUseCase {
  constructor(
    protected readonly userRepository: UserRepository,
    protected readonly logger: Logger,
    protected readonly i18n: I18nService,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const startTime = Date.now();
    const requestContext = {
      operation: 'CreateUser',
      requestingUserId: request.requestingUserId,
      targetEmail: request.email,
      targetRole: request.role,
    };

    this.logger.info(
      this.i18n.t('operations.user.creation_attempt'),
      requestContext,
    );

    try {
      // 1. Validation de l'utilisateur demandeur
      this.logger.debug(
        this.i18n.t('operations.user.validation_process'),
        requestContext,
      );

      const requestingUser = await this.userRepository.findById(
        request.requestingUserId,
      );
      if (!requestingUser) {
        this.logger.warn(
          this.i18n.t('warnings.user.not_found'),
          requestContext,
        );
        throw new UserNotFoundError(request.requestingUserId);
      }

      // 2. Vérification des permissions
      this.logger.debug(
        this.i18n.t('operations.permission.check', { operation: 'CreateUser' }),
        requestContext,
      );
      this.validatePermissions(requestingUser, request.role);

      // 3. Validation des données d'entrée
      this.validateInput(request);

      // 4. Création de l'email (validation automatique)
      let email: Email;
      try {
        email = new Email(request.email.trim());
      } catch {
        this.logger.warn(
          this.i18n.t('warnings.email.invalid_format', {
            email: request.email,
          }),
          { ...requestContext, email: request.email },
        );
        throw new InvalidEmailFormatError(request.email);
      }

      // 5. Vérification de l'unicité de l'email
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        this.logger.warn(
          this.i18n.t('warnings.email.already_exists', {
            email: email.value,
          }),
          { ...requestContext, email: email.value },
        );
        throw new EmailAlreadyExistsError(email.value);
      }

      // 6. Création et sauvegarde de l'utilisateur
      const newUser = new User(email, request.name.trim(), request.role);
      const savedUser = await this.userRepository.save(newUser);

      const duration = Date.now() - startTime;

      // Log de succès avec détails
      this.logger.info(
        this.i18n.t('success.user.creation_success', {
          email: savedUser.email.value,
          requestingUser: requestingUser.email.value,
        }),
        { ...requestContext, userId: savedUser.id, duration },
      );

      // Audit trail traduit
      this.logger.audit(
        this.i18n.t('audit.user.created'),
        request.requestingUserId,
        {
          targetUserId: savedUser.id,
          targetEmail: savedUser.email.value,
          targetRole: savedUser.role,
        },
      );

      // 7. Retour de la réponse
      return {
        id: savedUser.id || 'generated-id',
        email: savedUser.email.value,
        name: savedUser.name,
        role: savedUser.role,
        createdAt: savedUser.createdAt || new Date(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        this.i18n.t('operations.failed', { operation: 'CreateUser' }),
        error as Error,
        { ...requestContext, duration },
      );
      throw error;
    }
  }

  private validatePermissions(
    requestingUser: User,
    targetRole: UserRole,
  ): void {
    // Seuls les admins et managers peuvent créer des utilisateurs
    if (!requestingUser.hasPermission(Permission.CREATE_USER)) {
      this.logger.warn(this.i18n.t('warnings.permission.denied'), {
        requestingUserId: requestingUser.id,
        requestingUserRole: requestingUser.role,
        requiredPermission: Permission.CREATE_USER,
      });
      throw new InsufficientPermissionsError(
        Permission.CREATE_USER,
        requestingUser.role,
      );
    }

    // Les managers ne peuvent créer que des utilisateurs réguliers
    if (requestingUser.role === UserRole.MANAGER) {
      if (targetRole === UserRole.SUPER_ADMIN) {
        this.logger.warn(
          this.i18n.t('warnings.role.elevation_attempt', {
            targetRole: UserRole.SUPER_ADMIN,
          }),
          { requestingUserId: requestingUser.id, targetRole },
        );
        throw new RoleElevationError(UserRole.MANAGER, UserRole.SUPER_ADMIN);
      }
      if (targetRole === UserRole.MANAGER) {
        this.logger.warn(
          this.i18n.t('warnings.role.elevation_attempt', {
            targetRole: UserRole.MANAGER,
          }),
          { requestingUserId: requestingUser.id, targetRole },
        );
        throw new RoleElevationError(UserRole.MANAGER, UserRole.MANAGER);
      }
    }
  }

  private validateInput(request: CreateUserRequest): void {
    if (!request.name || request.name.trim().length === 0) {
      this.logger.warn(
        this.i18n.t('operations.validation.failed', { field: 'name' }),
        { name: request.name, reason: 'empty' },
      );
      throw new InvalidNameError(
        request.name,
        this.i18n.t('errors.name.empty'),
      );
    }

    if (request.name.trim().length > 100) {
      this.logger.warn(
        this.i18n.t('operations.validation.failed', { field: 'name' }),
        { name: request.name, reason: 'too_long' },
      );
      throw new InvalidNameError(
        request.name,
        this.i18n.t('errors.name.too_long'),
      );
    }
  }
}
