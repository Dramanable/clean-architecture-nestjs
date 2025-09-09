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
  UseGuards,
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
import type { LocalStrategyResult } from '../../infrastructure/security/strategies/local.strategy';
import type { I18nService } from '../../application/ports/i18n.port';
import type { Logger } from '../../application/ports/logger.port';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { User } from '../../domain/entities/user.entity';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../../infrastructure/security/public.decorator';
import { AuthRateLimit } from '../../infrastructure/security/rate-limit.decorators';
import { TOKENS } from '../../shared/constants/injection-tokens';
import {
  LoginDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenResponseDto,
  UserInfoResponseDto,
} from '../dtos/auth.dto';

interface AuthenticatedRequest extends Request {
  user: User;
}

interface LocalAuthenticatedRequest extends Request {
  user: LocalStrategyResult; // Données utilisateur validées par LocalStrategy
}

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
  @UseGuards(AuthGuard('local'))
  @Public()
  @AuthRateLimit()
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
    @Req() req: LocalAuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    try {
      // ✅ APPROCHE CLEAN ARCHITECTURE
      // 1. LocalStrategy a validé les credentials (email/password) → req.user populated
      // 2. AuthController appelle LoginUseCase pour logique business (tokens, audit)

      if (!req.user) {
        throw new UnauthorizedException('Authentication failed');
      }

      // LocalStrategy nous donne les données utilisateur validées
      const validatedUser = req.user;

      // Maintenant appeler LoginUseCase pour la logique business complète
      // (tokens, audit, logging, refresh token management, etc.)
      const result = await this.loginUseCase.execute({
        email: validatedUser.email,
        password: loginDto.password, // LoginUseCase a besoin du password pour logs/audit
        userAgent: req.headers['user-agent'],
        ipAddress: this.extractClientIp(req),
      });

      // 🍪 Set HttpOnly cookies using CookieService adapter
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
        'access_token',
        result.tokens.accessToken,
        {
          expires: new Date(Date.now() + accessTokenExpirationMs),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        },
      );

      this.cookieService.setCookie(
        res,
        'refresh_token',
        result.tokens.refreshToken,
        {
          expires: new Date(Date.now() + refreshTokenExpirationMs),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        },
      );

      this.logger.info('🍪 LOGIN - Cookies set successfully', {
        operation: 'Login',
        userId: result.user.id,
        accessTokenExpires: new Date(Date.now() + accessTokenExpirationMs),
        refreshTokenExpires: new Date(Date.now() + refreshTokenExpirationMs),
        accessTokenLength: result.tokens.accessToken.length,
        refreshTokenLength: result.tokens.refreshToken.length,
        environment: process.env.NODE_ENV,
        secure: process.env.NODE_ENV === 'production',
      });

      return {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
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
  @ApiCookieAuth('refresh_token')
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshTokenResponseDto> {
    this.logger.info('🔄 REFRESH TOKEN - Attempting to refresh token', {
      operation: 'RefreshToken',
      cookiesPresent: !!req.cookies,
      cookieNames: req.cookies ? Object.keys(req.cookies) : [],
      userAgent: req.headers['user-agent'],
      ip: this.extractClientIp(req),
    });

    const refreshToken = this.cookieService.getCookie(req, 'refresh_token');

    this.logger.info('🔄 REFRESH TOKEN - Cookie extraction result', {
      operation: 'RefreshToken',
      tokenFound: !!refreshToken,
      tokenLength: refreshToken ? refreshToken.length : 0,
      allCookies: req.cookies,
    });

    if (!refreshToken) {
      this.logger.warn('🔄 REFRESH TOKEN - No refresh token found in cookies', {
        operation: 'RefreshToken',
        availableCookies: req.cookies ? Object.keys(req.cookies) : [],
        headers: req.headers.cookie,
      });
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const result = await this.refreshTokenUseCase.execute({
        refreshToken,
      });

      // Définir les nouveaux tokens dans les cookies
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
        'access_token',
        result.tokens.accessToken,
        {
          expires: new Date(Date.now() + accessTokenExpirationMs),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        },
      );

      this.cookieService.setCookie(
        res,
        'refresh_token',
        result.tokens.refreshToken,
        {
          expires: new Date(Date.now() + refreshTokenExpirationMs),
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        },
      );

      this.logger.info('✅ REFRESH TOKEN - Token refreshed successfully', {
        operation: 'RefreshToken',
        userId: result.user.id,
        userEmail: result.user.email,
        newAccessTokenLength: result.tokens.accessToken.length,
        newRefreshTokenLength: result.tokens.refreshToken.length,
      });

      return {
        success: true,
        user: result.user,
      };
    } catch (error) {
      this.logger.error(
        '❌ REFRESH TOKEN - Failed to refresh token',
        error as Error,
        {
          operation: 'RefreshToken',
          tokenProvided: !!refreshToken,
        },
      );
      throw error;
    }
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
  @ApiCookieAuth('refresh_token')
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
      const refreshToken = this.cookieService.getCookie(req, 'refresh_token');

      await this.logoutUseCase.execute({
        refreshToken: refreshToken || '',
        logoutAll: logoutAll === 'true',
        userAgent: req.headers['user-agent'],
        ipAddress: this.extractClientIp(req),
      });

      // Clear cookies using CookieService adapter
      this.cookieService.clearCookie(res, 'access_token');
      this.cookieService.clearCookie(res, 'refresh_token');
      req.user = undefined;
      return {
        success: true,
        message: this.i18n.t('auth.logout_success'),
      };
    } catch {
      // Le logout réussit toujours pour des raisons de sécurité
      this.cookieService.clearCookie(res, 'access_token');
      this.cookieService.clearCookie(res, 'refresh_token');

      return {
        success: true,
        message: this.i18n.t('auth.logout_success'),
      };
    }
  }

  /**
   * 👤 GET USER INFO ENDPOINT
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get current user information',
    description: 'Get information about the currently authenticated user',
  })
  @ApiCookieAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: UserInfoResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Authentication required',
  })
  me(@Req() req: AuthenticatedRequest): UserInfoResponseDto {
    // req.user est automatiquement populé par JwtAuthGuard via JwtStrategy
    return {
      user: {
        id: req.user.id,
        email: req.user.email.value,
        name: req.user.name,
        role: req.user.role,
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
