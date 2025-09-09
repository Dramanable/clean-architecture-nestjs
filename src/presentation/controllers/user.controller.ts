/**
 * 🎨 PRESENTATION LAYER - User Controller avec Clean Architecture + Swagger
 *
 * Contrôleur NestJS qui respecte la Clean   })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUserId() currentUserId: string,
  ): Promise<any> {
    this.logger.info('🎯 HTTP POST /users - Create user request', {
      operation: 'HTTP_CreateUser',
      requestData: createUserDto,
    });

    try {
      // 🎯 NOUVEAU : Utilisation du service d'orchestration au lieu du use case direct
      const result = await this.userOnboardingService.createUserWithOnboarding({
        requestingUserId: currentUserId, // ✅ Utilisateur authentifié depuis le JWT
        email: createUserDto.email,
        name: createUserDto.name,
        role: createUserDto.role,
        sendWelcomeEmail: createUserDto.sendWelcomeEmail ?? true, // Par défaut : envoi email
      });ec documentation OpenAPI
 * Injection des dépendances au niveau présentation uniquement
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { I18nService } from '../../application/ports/i18n.port';
import type { ICacheService } from '../../application/ports/cache.port';
import type { Logger } from '../../application/ports/logger.port';
import { UserOnboardingApplicationService } from '../../application/services/user-onboarding.application-service';
import { GetUserUseCase } from '../../application/use-cases/users/get-user.use-case';
import { SearchUsersUseCase } from '../../application/use-cases/users/search-users.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/users/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/users/delete-user.use-case';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { TOKENS } from '../../shared/constants/injection-tokens';
import { ApiErrorResponseDto } from '../dtos/common.dto';
import { CurrentUserId } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import {
  CreateUserDto,
  UserResponseDto,
  UpdateUserDto,
} from '../dtos/user.dto';
import { SearchUsersSimpleDto } from '../dtos/search-users.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard) // ✅ Protection JWT pour toutes les routes
export class UserController {
  private readonly getUserUseCase: GetUserUseCase;
  private readonly searchUsersUseCase: SearchUsersUseCase;
  private readonly updateUserUseCase: UpdateUserUseCase;
  private readonly deleteUserUseCase: DeleteUserUseCase;

  constructor(
    // 🔧 Injection des dépendances via tokens centralisés (Clean Architecture)
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
    @Inject(TOKENS.CACHE_SERVICE)
    private readonly cacheService: ICacheService,
    // 🎯 Service d'orchestration pour création d'utilisateurs
    @Inject(TOKENS.USER_ONBOARDING_SERVICE)
    private readonly userOnboardingService: UserOnboardingApplicationService,
  ) {
    // 🏗️ Construction du use case avec injection manuelle (respecte Clean Architecture)
    this.getUserUseCase = new GetUserUseCase(
      this.userRepository,
      this.logger,
      this.i18n,
    );

    this.searchUsersUseCase = new SearchUsersUseCase(
      this.userRepository,
      this.logger,
      this.i18n,
    );

    this.updateUserUseCase = new UpdateUserUseCase(
      this.userRepository,
      this.logger,
      this.i18n,
      this.cacheService,
    );

    this.deleteUserUseCase = new DeleteUserUseCase(
      this.userRepository,
      this.logger,
      this.i18n,
      this.cacheService,
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Creates a new user with onboarding process including welcome email',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User data for creation',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid user data',
    type: ApiErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
    type: ApiErrorResponseDto,
  })
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @CurrentUserId() currentUserId: string,
  ): Promise<UserResponseDto> {
    this.logger.info('🎯 HTTP POST /users - Create user request', {
      operation: 'HTTP_CreateUser',
      requestData: createUserDto,
    });

    try {
      // 🎯 NOUVEAU : Utilisation du service d'orchestration au lieu du use case direct
      const result = await this.userOnboardingService.createUserWithOnboarding({
        requestingUserId: currentUserId, // ✅ Utilisateur authentifié depuis le JWT
        email: createUserDto.email,
        name: createUserDto.name,
        role: createUserDto.role,
        sendWelcomeEmail: createUserDto.sendWelcomeEmail ?? true, // Par défaut : envoi email
      });

      this.logger.info('✅ HTTP POST /users - User onboarded successfully', {
        operation: 'HTTP_CreateUser',
        userId: result.id,
        onboardingStatus: result.onboardingStatus,
      });

      return {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        passwordChangeRequired: false, // Valeur par défaut pour un nouvel utilisateur
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        '❌ HTTP POST /users - User creation failed',
        error as Error,
        {
          operation: 'HTTP_CreateUser',
          requestData: createUserDto,
        },
      );

      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a user by their unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ApiErrorResponseDto,
  })
  async getUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<UserResponseDto> {
    this.logger.info('🎯 HTTP GET /users/:id - Get user request', {
      operation: 'HTTP_GetUser',
      userId: id,
    });

    try {
      const result = await this.getUserUseCase.execute({
        requestingUserId: currentUserId, // ✅ Utilisateur authentifié depuis le JWT
        userId: id,
      });

      this.logger.info('✅ HTTP GET /users/:id - User retrieved successfully', {
        operation: 'HTTP_GetUser',
        userId: id,
      });

      // Utiliser le mapper pour convertir l'entité domaine en DTO
      return {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        passwordChangeRequired: result.passwordChangeRequired,
        createdAt: result.createdAt.toISOString(),
        updatedAt:
          result.updatedAt?.toISOString() || result.createdAt.toISOString(),
      };
    } catch (error) {
      this.logger.error(
        '❌ HTTP GET /users/:id - User retrieval failed',
        error as Error,
        {
          operation: 'HTTP_GetUser',
          userId: id,
        },
      );

      throw error;
    }
  }

  /**
   * 🔍 Rechercher et filtrer les utilisateurs (POST)
   * Accès SUPER_ADMIN uniquement
   */
  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔍 Search and filter users',
    description: `
      Recherche avancée d'utilisateurs avec filtres et pagination.
      
      **Accès:** SUPER_ADMIN uniquement
      
      **Fonctionnalités:**
      - Recherche textuelle dans nom et email
      - Filtres par rôles, statut actif, dates de création
      - Pagination avec tri personnalisable
      - Audit et logging complets
      
      **Utilise POST** pour permettre des critères de recherche complexes.
    `,
  })
  @ApiBody({
    description: 'Critères de recherche et filtres',
    examples: {
      basic_search: {
        summary: 'Recherche basique',
        value: {
          searchTerm: 'john',
          page: 1,
          limit: 20,
        },
      },
      advanced_filters: {
        summary: 'Filtres avancés',
        value: {
          searchTerm: 'manager',
          roles: ['MANAGER'],
          isActive: true,
          page: 1,
          limit: 50,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Résultats de recherche avec pagination',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - SUPER_ADMIN requis',
  })
  @ApiResponse({
    status: 400,
    description: 'Paramètres de recherche invalides',
  })
  async searchUsers(
    @Body() searchDto: SearchUsersSimpleDto,
    @CurrentUserId() currentUserId: string,
  ): Promise<any> {
    this.logger.info('🎯 HTTP POST /users/search - Search users request', {
      operation: 'HTTP_SearchUsers',
      requestData: searchDto,
    });

    try {
      const result = await this.searchUsersUseCase.execute({
        requestingUserId: currentUserId, // ✅ Utilisateur authentifié depuis le JWT
        searchTerm: searchDto.searchTerm,
        roles: searchDto.roles,
        isActive: searchDto.isActive,
        createdAfter: searchDto.createdAfter
          ? new Date(searchDto.createdAfter)
          : undefined,
        createdBefore: searchDto.createdBefore
          ? new Date(searchDto.createdBefore)
          : undefined,
        page: searchDto.page,
        limit: searchDto.limit,
        sortBy: searchDto.sortBy,
        sortOrder: searchDto.sortOrder,
      });

      this.logger.info(
        '✅ HTTP POST /users/search - Users searched successfully',
        {
          operation: 'HTTP_SearchUsers',
          resultCount: result.users.length,
          totalItems: result.pagination.totalItems,
        },
      );

      return {
        users: result.users,
        pagination: result.pagination,
        appliedFilters: result.appliedFilters,
      };
    } catch (error) {
      this.logger.error(
        '❌ HTTP POST /users/search - User search failed',
        error as Error,
        {
          operation: 'HTTP_SearchUsers',
          requestData: searchDto,
        },
      );

      throw error;
    }
  }

  /**
   * ✏️ Mettre à jour un utilisateur (PUT)
   * Accès SUPER_ADMIN uniquement
   */
  @Put(':id')
  @ApiOperation({
    summary: '✏️ Update user',
    description: `
      Mettre à jour les informations d'un utilisateur.
      
      **Accès:** SUPER_ADMIN uniquement
      
      **Fonctionnalités:**
      - Modification des informations de base (nom, email)
      - Changement de rôle
      - Validation des règles métier
      - Audit et logging complets
    `,
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'utilisateur à modifier",
    type: 'string',
    format: 'uuid',
  })
  @ApiBody({
    description: 'Nouvelles données utilisateur (partielles)',
    examples: {
      update_name: {
        summary: 'Modifier le nom',
        value: {
          name: 'John Smith',
        },
      },
      update_email: {
        summary: "Modifier l'email",
        value: {
          email: 'john.smith@company.com',
        },
      },
      change_role: {
        summary: 'Changer le rôle',
        value: {
          role: 'MANAGER',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur mis à jour avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 400,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - SUPER_ADMIN requis',
  })
  async updateUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body() updateDto: UpdateUserDto,
    @CurrentUserId() currentUserId: string,
  ): Promise<UserResponseDto> {
    this.logger.info('🎯 HTTP PUT /users/:id - Update user request', {
      operation: 'HTTP_UpdateUser',
      userId,
      updateData: updateDto,
    });

    try {
      const result = await this.updateUserUseCase.execute({
        userId,
        name: updateDto.name,
        role: updateDto.role,
        passwordChangeRequired: updateDto.passwordChangeRequired,
        requestingUserId: currentUserId, // ✅ Utilisateur authentifié depuis le JWT
      });
      this.logger.info('✅ HTTP PUT /users/:id - User updated successfully', {
        operation: 'HTTP_UpdateUser',
        userId,
      });

      return {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
        passwordChangeRequired: false, // Default from UpdateUserResponse
        createdAt: new Date().toISOString(), // Not in UpdateUserResponse
        updatedAt: result.updatedAt.toISOString(),
      };
    } catch (error) {
      this.logger.error(
        '❌ HTTP PUT /users/:id - User update failed',
        error as Error,
        {
          operation: 'HTTP_UpdateUser',
          userId,
          updateData: updateDto,
        },
      );

      throw error;
    }
  }

  /**
   * 🗑️ Supprimer un utilisateur (DELETE)
   * Accès SUPER_ADMIN uniquement
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '🗑️ Delete user',
    description: `
      Supprimer un utilisateur du système.
      
      **Accès:** SUPER_ADMIN uniquement
      
      **Attention:** Cette action est irréversible.
      
      **Règles métier:**
      - Impossible de supprimer le dernier SUPER_ADMIN
      - Audit de l'opération de suppression
    `,
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'utilisateur à supprimer",
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Utilisateur supprimé avec succès',
  })
  @ApiResponse({
    status: 404,
    description: 'Utilisateur non trouvé',
  })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer (ex: dernier super admin)',
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - SUPER_ADMIN requis',
  })
  async deleteUser(
    @Param('id', ParseUUIDPipe) userId: string,
    @CurrentUserId() currentUserId: string,
  ): Promise<void> {
    this.logger.info('🎯 HTTP DELETE /users/:id - Delete user request', {
      operation: 'HTTP_DeleteUser',
      userId,
    });

    try {
      await this.deleteUserUseCase.execute({
        requestingUserId: currentUserId, // ✅ Utilisateur authentifié depuis le JWT
        userId: userId,
      });

      this.logger.info(
        '✅ HTTP DELETE /users/:id - User deleted successfully',
        {
          operation: 'HTTP_DeleteUser',
          userId,
        },
      );
    } catch (error) {
      this.logger.error(
        '❌ HTTP DELETE /users/:id - User deletion failed',
        error as Error,
        {
          operation: 'HTTP_DeleteUser',
          userId,
        },
      );

      throw error;
    }
  }
}
