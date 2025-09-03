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
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { InvalidCredentialsError } from '../../application/exceptions/auth.exceptions';
import type { IConfigService } from '../../application/ports/config.port';
import type { ICookieService } from '../../application/ports/cookie.port';
import type { I18nService } from '../../application/ports/i18n.port';
import type { Logger } from '../../application/ports/logger.port';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { Public } from '../../infrastructure/security/public.decorator';
import { TOKENS } from '../../shared/constants/injection-tokens';
import {
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenResponseDto,
  UserInfoResponseDto,
} from '../dtos/auth.dto';

@ApiTags('auth')
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
    @Inject(TOKENS.CONFIG_SERVICE)
    private readonly configService: IConfigService,
    @Inject(TOKENS.COOKIE_SERVICE)
    private readonly cookieService: ICookieService,
  ) {}

  /**
   * 🔑 LOGIN ENDPOINT
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password',
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
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    try {
      const result = await this.loginUseCase.execute({
        email: loginDto.email,
        password: loginDto.password,
        userAgent: req.headers['user-agent'],
        ipAddress: this.extractClientIp(req),
      });

      // Set HttpOnly cookies using CookieService adapter
      const accessTokenExpirationMs =
        this.configService.getAccessTokenExpirationTime() * 1000;
      const refreshTokenExpirationMs =
        this.configService.getRefreshTokenExpirationDays() *
        24 *
        60 *
        60 *
        1000;

      this.cookieService.setCookie(
        res,
        'accessToken',
        result.tokens.accessToken,
        {
          maxAge: accessTokenExpirationMs,
        },
      );

      this.cookieService.setCookie(
        res,
        'refreshToken',
        result.tokens.refreshToken,
        {
          maxAge: refreshTokenExpirationMs,
        },
      );

      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      // Le Use Case a déjà fait le logging approprié
      // Controller se contente de transformer l'exception en réponse HTTP
      if (error instanceof InvalidCredentialsError) {
        throw new UnauthorizedException(
          this.i18n.t('auth.invalid_credentials', { email: loginDto.email }),
        );
      }
      throw error; // Re-throw other errors as-is
    }
  }

  /**
   * 🔄 REFRESH TOKEN ENDPOINT
   */
  @Public()
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Refresh the access token using the refresh token from cookies',
  })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(@Req() req: Request): Promise<RefreshTokenResponseDto> {
    const refreshToken = this.cookieService.getCookie(req, 'refreshToken');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const result = await this.refreshTokenUseCase.execute({
      refreshToken,
    });

    return {
      success: true,
      user: result.user,
    };
  }

  /**
   * 🚪 LOGOUT ENDPOINT
   */
  @Get('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description: 'Logout user and invalidate tokens',
  })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  async logout(
    @Query('logoutAll') logoutAll: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto> {
    try {
      const refreshToken = this.cookieService.getCookie(req, 'refreshToken');

      await this.logoutUseCase.execute({
        refreshToken: refreshToken || '',
        logoutAll: logoutAll === 'true',
        userAgent: req.headers['user-agent'],
        ipAddress: this.extractClientIp(req),
      });

      // Clear cookies using CookieService adapter
      this.cookieService.clearCookie(res, 'accessToken');
      this.cookieService.clearCookie(res, 'refreshToken');

      return {
        success: true,
        message: this.i18n.t('auth.logout_success'),
      };
    } catch {
      // Le logout réussit toujours pour des raisons de sécurité
      this.cookieService.clearCookie(res, 'accessToken');
      this.cookieService.clearCookie(res, 'refreshToken');

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
  @ApiOperation({
    summary: 'Get current user information',
    description: 'Get information about the currently authenticated user',
  })
  @ApiCookieAuth('accessToken')
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: UserInfoResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  me(): UserInfoResponseDto {
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
}
