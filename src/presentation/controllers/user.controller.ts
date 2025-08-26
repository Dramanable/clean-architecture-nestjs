/**
 * 🎨 PRESENTATION LAYER - User Controller avec Clean Architecture + Swagger
 *
 * Contrôleur NestJS qui respecte la Clean Architecture avec documentation OpenAPI
 * Injection des dépendances au niveau présentation uniquement
 */

import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
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
import type { Logger } from '../../application/ports/logger.port';
import { UserOnboardingApplicationService } from '../../application/services/user-onboarding.application-service';
import { GetUserUseCase } from '../../application/use-cases/users/get-user.use-case';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { TOKENS } from '../../shared/constants/injection-tokens';
import { ApiErrorResponseDto } from '../dtos/common.dto';
import { CreateUserDto, UserResponseDto } from '../dtos/user.dto';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
export class UserController {
  private readonly getUserUseCase: GetUserUseCase;

  constructor(
    // 🔧 Injection des dépendances via tokens centralisés (Clean Architecture)
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
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
  ): Promise<UserResponseDto> {
    this.logger.info('🎯 HTTP POST /users - Create user request', {
      operation: 'HTTP_CreateUser',
      requestData: createUserDto,
    });

    try {
      // 🎯 NOUVEAU : Utilisation du service d'orchestration au lieu du use case direct
      const result = await this.userOnboardingService.createUserWithOnboarding({
        requestingUserId: 'system', // À récupérer du JWT en réalité
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
  ): Promise<UserResponseDto> {
    this.logger.info('🎯 HTTP GET /users/:id - Get user request', {
      operation: 'HTTP_GetUser',
      userId: id,
    });

    try {
      const result = await this.getUserUseCase.execute({
        requestingUserId: 'system', // À récupérer du JWT en réalité
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
}
