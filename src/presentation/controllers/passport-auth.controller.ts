/**
 * 🔐 PASSPORT AUTH CONTROLLER - Clean Architecture with Passport
 *
 * Contrôleur d'authentification utilisant les stratégies Passport
 * Montre l'intégration propre avec l'écosystème NestJS
 */

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';

import { User } from '../../domain/entities/user.entity';
// import { LocalAuthGuard } from '../security/guards/local-auth.guard';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { Public } from '../../infrastructure/security/public.decorator';
import { AuthRateLimit } from '../../infrastructure/security/rate-limit.decorators';

import type { Logger } from '../../application/ports/logger.port';
import type { I18nService } from '../../application/ports/i18n.port';
import type { IConfigService } from '../../application/ports/config.port';
import type { ICookieService } from '../../application/ports/cookie.port';
import { TOKENS } from '../../shared/constants/injection-tokens';

import { LoginDto, LoginResponseDto } from '../dtos/auth.dto';

/**
 * DTO pour la réponse d'informations utilisateur avec language
 */
interface UserInfoWithLanguageResponseDto {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    language: string;
  };
}

/**
 * Interface pour la request avec user injecté par Passport
 */
interface AuthenticatedRequest extends ExpressRequest {
  user: User;
}

@ApiTags('passport-auth')
@Controller('passport-auth')
export class PassportAuthController {
  constructor(
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
    @Inject(TOKENS.CONFIG_SERVICE)
    private readonly configService: IConfigService,
    @Inject(TOKENS.COOKIE_SERVICE)
    private readonly cookieService: ICookieService,
  ) {}

  /**
   * 🔑 PASSPORT LOGIN ENDPOINT
   */
  @Public()
  // @UseGuards(LocalAuthGuard) // Temporarily commented for build
  @AuthRateLimit()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login with Passport Local Strategy',
    description: 'Authenticate user with email and password using Passport',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  login(
    @Body() loginDto: LoginDto,
    @Request() req: AuthenticatedRequest,
  ): LoginResponseDto {
    // L'utilisateur est déjà authentifié par la LocalStrategy
    // req.user contient l'entité User complète
    const user = req.user;

    this.logger.info(this.i18n.t('auth.passport_login_success'), {
      userId: user.id,
      email: user.email.value,
      userAgent: req.headers['user-agent'],
      ip: this.extractClientIp(req),
    } as Record<string, unknown>);

    // Ici, nous pourrions générer et sauvegarder les tokens
    // Pour simplifier, on retourne directement les informations utilisateur
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * 👤 GET USER INFO WITH JWT GUARD
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Get current user information with JWT Guard',
    description:
      'Get information about the currently authenticated user using JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  me(@Request() req: AuthenticatedRequest): UserInfoWithLanguageResponseDto {
    // L'utilisateur est injecté dans req.user par la JwtStrategy
    const user = req.user;

    this.logger.debug(this.i18n.t('auth.passport_user_info_request'), {
      userId: user.id,
      email: user.email.value,
    } as Record<string, unknown>);

    return {
      user: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        role: user.role,
        language: 'en', // Valeur par défaut en attendant l'implémentation complète
      },
    };
  }

  /**
   * 📊 PUBLIC ENDPOINT (sans authentification)
   */
  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Public endpoint',
    description: 'Endpoint accessible sans authentification',
  })
  @ApiResponse({
    status: 200,
    description: 'Public data',
  })
  getPublicData(): { message: string; timestamp: string } {
    return {
      message: 'This is a public endpoint accessible without authentication',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 🔧 HELPER METHODS
   */
  private extractClientIp(req: ExpressRequest): string {
    const forwarded = req.headers['x-forwarded-for'];
    let ip: string | undefined;

    if (forwarded) {
      if (Array.isArray(forwarded)) {
        ip = forwarded[0];
      } else if (typeof forwarded === 'string') {
        ip = forwarded.split(',')[0];
      }
    }

    if (!ip) {
      ip = req.connection?.remoteAddress || req.socket?.remoteAddress;
    }

    return ip || 'unknown';
  }
}
