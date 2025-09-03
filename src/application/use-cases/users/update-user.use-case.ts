/**
 * 🎯 Update User Use Case
 *
 * Règles métier pour la modification d'utilisateurs avec logging et i18n
 */

import { UserRepository } from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { UserRole, Permission } from '../../../shared/enums/user-role.enum';
import { Logger } from '../../ports/logger.port';
import type { I18nService } from '../../ports/i18n.port';
import type { ICacheService } from '../../ports/cache.port';
import {
  UserNotFoundError,
  EmailAlreadyExistsError,
  InsufficientPermissionsError,
  InvalidEmailFormatError,
  InvalidNameError,
  RoleElevationError,
} from '../../../domain/exceptions/user.exceptions';

// DTOs
export interface UpdateUserRequest {
  userId: string;
  email?: string;
  name?: string;
  role?: UserRole;
  passwordChangeRequired?: boolean;
  requestingUserId: string;
}

export interface UpdateUserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  updatedAt: Date;
}

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(request: UpdateUserRequest): Promise<UpdateUserResponse> {
    const startTime = Date.now();
    const requestContext = {
      operation: 'UpdateUser',
      requestingUserId: request.requestingUserId,
      targetUserId: request.userId,
      updates: {
        email: request.email,
        name: request.name,
        role: request.role,
      },
    };

    this.logger.info(
      this.i18n.t('operations.user.update_attempt', { userId: request.userId }),
      requestContext,
    );

    try {
      // 1. Validation de l'utilisateur demandeur
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

      // 2. Validation de l'utilisateur cible
      const targetUser = await this.userRepository.findById(request.userId);
      if (!targetUser) {
        this.logger.warn(this.i18n.t('warnings.user.not_found'), {
          ...requestContext,
          targetUserId: request.userId,
        });
        throw new UserNotFoundError(request.userId);
      }

      // 3. Vérification des permissions
      this.validatePermissions(requestingUser, targetUser, request);

      // 4. Validation des données d'entrée
      await this.validateInput(request, targetUser);

      // 5. Construction des données de mise à jour
      const updateData: Partial<{
        email: string;
        name: string;
        role: UserRole;
      }> = {};

      if (request.name !== undefined) {
        updateData.name = request.name.trim();
      }

      if (request.email !== undefined) {
        // Email validation déjà faite dans validateInput
        updateData.email = request.email.trim().toLowerCase();
      }

      if (request.role !== undefined) {
        updateData.role = request.role;
      }

      // 6. Mise à jour de l'utilisateur - Construction du User mis à jour
      const updatedUser = new User(
        request.email !== undefined
          ? new Email(request.email.trim())
          : targetUser.email,
        request.name !== undefined ? request.name.trim() : targetUser.name,
        request.role !== undefined ? request.role : targetUser.role,
      );

      // Copie de l'ID existant si disponible
      if (targetUser.id) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (updatedUser as any).id = targetUser.id;
      }

      const savedUser = await this.userRepository.update(updatedUser);

      // 🗑️ Invalider le cache de l'utilisateur modifié
      try {
        await this.cacheService.invalidateUserCache(savedUser.id);
        this.logger.debug(
          this.i18n.t('infrastructure.cache.user_cache_invalidated'),
          {
            ...requestContext,
            invalidatedUserId: savedUser.id,
          },
        );
      } catch (cacheError) {
        // Ne pas faire échouer l'opération si le cache échoue
        this.logger.warn(
          this.i18n.t('infrastructure.cache.user_cache_invalidation_failed'),
          {
            ...requestContext,
            cacheError: (cacheError as Error).message,
          },
        );
      }

      const duration = Date.now() - startTime;

      // Log de succès avec détails
      this.logger.info(
        this.i18n.t('success.user.update_success', {
          email: savedUser.email.value,
          requestingUser: requestingUser.email.value,
        }),
        { ...requestContext, duration },
      );

      // Audit trail traduit
      this.logger.audit(
        this.i18n.t('audit.user.updated'),
        request.requestingUserId,
        {
          targetUserId: savedUser.id,
          targetEmail: savedUser.email.value,
          changes: updateData,
        },
      );

      // 7. Retour de la réponse
      return {
        id: savedUser.id || request.userId,
        email: savedUser.email.value,
        name: savedUser.name,
        role: savedUser.role,
        updatedAt: new Date(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        this.i18n.t('operations.failed', { operation: 'UpdateUser' }),
        error as Error,
        { ...requestContext, duration },
      );
      throw error;
    }
  }

  private validatePermissions(
    requestingUser: User,
    targetUser: User,
    request: UpdateUserRequest,
  ): void {
    // Les utilisateurs peuvent modifier leur propre profil (sauf le rôle)
    const isSelfUpdate = requestingUser.id === targetUser.id;

    if (isSelfUpdate) {
      // Utilisateur modifie son propre profil
      if (request.role !== undefined) {
        // Ne peut pas changer son propre rôle
        this.logger.warn(this.i18n.t('warnings.permission.denied'), {
          reason: 'self_role_change_forbidden',
          requestingUserId: requestingUser.id,
        });
        throw new InsufficientPermissionsError(
          'CHANGE_OWN_ROLE',
          requestingUser.role,
        );
      }
      return; // Peut modifier son propre nom/email
    }

    // Modification d'un autre utilisateur - il faut avoir UPDATE_USER ET être manager/admin
    if (
      !requestingUser.hasPermission(Permission.UPDATE_USER) ||
      requestingUser.role === UserRole.USER
    ) {
      this.logger.warn(this.i18n.t('warnings.permission.denied'), {
        requestingUserId: requestingUser.id,
        requestingUserRole: requestingUser.role,
        requiredPermission: Permission.UPDATE_USER,
        reason: 'regular_user_cannot_update_others',
      });
      throw new InsufficientPermissionsError(
        Permission.UPDATE_USER,
        requestingUser.role,
      );
    }

    // Vérification des restrictions par rôle pour les changements de rôle
    if (request.role !== undefined) {
      this.validateRoleChange(requestingUser, targetUser, request.role);
    }

    // Les managers ne peuvent pas modifier les autres managers ou admins
    if (requestingUser.role === UserRole.MANAGER) {
      if (
        targetUser.role === UserRole.MANAGER ||
        targetUser.role === UserRole.SUPER_ADMIN
      ) {
        this.logger.warn(this.i18n.t('warnings.permission.denied'), {
          reason: 'manager_cannot_modify_manager_or_admin',
          requestingUserId: requestingUser.id,
          targetUserRole: targetUser.role,
        });
        throw new InsufficientPermissionsError(
          'MODIFY_MANAGER_OR_ADMIN',
          requestingUser.role,
        );
      }
    }
  }

  private validateRoleChange(
    requestingUser: User,
    targetUser: User,
    newRole: UserRole,
  ): void {
    // Seuls les super admins peuvent changer les rôles librement
    if (requestingUser.role !== UserRole.SUPER_ADMIN) {
      // Les managers ne peuvent pas élever vers manager ou admin
      if (requestingUser.role === UserRole.MANAGER) {
        if (newRole === UserRole.MANAGER || newRole === UserRole.SUPER_ADMIN) {
          this.logger.warn(
            this.i18n.t('warnings.role.elevation_attempt', {
              targetRole: newRole,
            }),
            {
              requestingUserId: requestingUser.id,
              targetUserId: targetUser.id,
              currentRole: targetUser.role,
              newRole,
            },
          );
          throw new RoleElevationError(requestingUser.role, newRole);
        }
      }
    }
  }

  private async validateInput(
    request: UpdateUserRequest,
    targetUser: User,
  ): Promise<void> {
    // Validation du nom
    if (request.name !== undefined) {
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

    // Validation de l'email
    if (request.email !== undefined) {
      let email: Email;
      try {
        email = new Email(request.email.trim());
      } catch {
        this.logger.warn(
          this.i18n.t('warnings.email.invalid_format', {
            email: request.email,
          }),
          { email: request.email },
        );
        throw new InvalidEmailFormatError(request.email);
      }

      // Vérifier l'unicité (sauf si c'est le même email)
      if (email.value !== targetUser.email.value) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
          this.logger.warn(
            this.i18n.t('warnings.email.already_exists', {
              email: email.value,
            }),
            { email: email.value, targetUserId: request.userId },
          );
          throw new EmailAlreadyExistsError(email.value);
        }
      }
    }
  }
}
