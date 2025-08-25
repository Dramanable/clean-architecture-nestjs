/**
 * 🔐 AUTH CONTROLLER - Clean Architecture with TDD
 *
 * Contrôleur d'authentification complet avec tous les Use Cases
 */

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  TokenExpiredError,
  TokenRepositoryError,
  UserNotFoundError,
} from '../../application/exceptions/auth.exceptions';
import type { I18nService } from '../../application/ports/i18n.port';
import type { Logger } from '../../application/ports/logger.port';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { TOKENS } from '../../shared/constants/injection-tokens';

// DTOs pour la validation
interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LogoutDto {
  logoutAll?: boolean;
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(TOKENS.LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCase,
    @Inject(TOKENS.REFRESH_TOKEN_USE_CASE)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(TOKENS.LOGOUT_USE_CASE)
    private readonly logoutUseCase: LogoutUseCase,
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {}

  /**
   * 🔑 LOGIN ENDPOINT
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; user: any }> {
    try {
      const result = await this.loginUseCase.execute({
        email: loginDto.email,
        password: loginDto.password,
        userAgent: req.headers['user-agent'],
        ipAddress: this.extractClientIp(req),
      });

      // Set HttpOnly cookies pour sécurité
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  /**
   * 🔄 REFRESH TOKEN ENDPOINT
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; user: any }> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        throw new InvalidRefreshTokenError(
          this.i18n.t('auth.refresh_token_missing'),
        );
      }

      const result = await this.refreshTokenUseCase.execute({
        refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: this.extractClientIp(req),
      });

      // Mise à jour des cookies avec les nouveaux tokens
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  /**
   * 🚪 LOGOUT ENDPOINT
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() logoutDto: LogoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      await this.logoutUseCase.execute({
        refreshToken: refreshToken || '',
        logoutAll: logoutDto.logoutAll || false,
        userAgent: req.headers['user-agent'],
        ipAddress: this.extractClientIp(req),
      });

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return {
        success: true,
        message: this.i18n.t('auth.logout_success'),
      };
    } catch (error) {
      // Le logout réussit toujours pour des raisons de sécurité
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return {
        success: true,
        message: this.i18n.t('auth.logout_success'),
      };
    }
  }

  /**
   * 👤 GET USER INFO ENDPOINT
   */
  @Get('me')
  async me(@Req() req: Request): Promise<{ user: any }> {
    // Cette méthode nécessiterait un middleware d'authentification
    // pour extraire l'utilisateur du token JWT
    // Pour l'instant, retournons un mock
    return {
      user: {
        id: 'current-user',
        email: 'user@example.com',
        name: 'Current User',
        role: 'USER',
      },
    };
  }

  /**
   * 🔧 HELPER METHODS
   */
  private extractClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0]
      : req.connection.remoteAddress || req.socket.remoteAddress;

    return ip || 'unknown';
  }

  private handleAuthError(error: any): never {
    this.logger.error(this.i18n.t('errors.auth.controller_error'), error, {
      operation: 'AUTH_CONTROLLER_ERROR',
      timestamp: new Date().toISOString(),
    });

    if (error instanceof InvalidCredentialsError) {
      throw new UnauthorizedException(this.i18n.t('auth.invalid_credentials'));
    }

    if (
      error instanceof InvalidRefreshTokenError ||
      error instanceof TokenExpiredError
    ) {
      throw new UnauthorizedException(
        this.i18n.t('auth.invalid_refresh_token'),
      );
    }

    if (error instanceof UserNotFoundError) {
      throw new UnauthorizedException(this.i18n.t('auth.user_not_found'));
    }

    if (error instanceof TokenRepositoryError) {
      throw new InternalServerErrorException(
        this.i18n.t('auth.service_unavailable'),
      );
    }

    // Erreur générique
    throw new InternalServerErrorException(
      this.i18n.t('auth.unexpected_error'),
    );
  }
}
