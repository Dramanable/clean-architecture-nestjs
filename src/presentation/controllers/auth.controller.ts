/**
 * 🔐 AUTH CONTROLLER - Single Responsibility Principle
 *
 * Contrôleur d'authentification respectant SRP :
 * - Gestion uniquement des endpoints HTTP
 * - Tokens gérés exclusivement via cookies HttpOnly
 * - Pas d'exposition des tokens dans les réponses
 */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import type { I18nService } from '../../application/ports/i18n.port';
import type { Logger } from '../../application/ports/logger.port';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { TOKENS } from '../../shared/constants/injection-tokens';

// DTOs pour la validation
interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RefreshDto {
  refreshToken?: string;
}

interface LogoutDto {
  logoutAll?: boolean;
}

// Réponses simplifiées respectant SRP (pas de tokens exposés)
interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  session: {
    sessionId: string;
    createdAt: string;
    expiresAt: string;
    deviceInfo: {
      userAgent?: string;
      ip: string;
    };
  };
}

interface RefreshTokenResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
    @Inject(TOKENS.CONFIG_SERVICE)
    private readonly configService: ConfigService,
    // Services d'authentification (à créer)
    // @Inject(TOKENS.AUTH_TOKEN_SERVICE)
    // private readonly authTokenService: AuthTokenService,
    // @Inject(TOKENS.PASSWORD_SERVICE)
    // private readonly passwordService: IPasswordService,
  ) {}

  /**
   * 🔐 LOGIN - Authentification avec email/password
   *
   * Responsabilité unique : Gérer l'endpoint HTTP de login
   * - Tokens stockés exclusivement dans les cookies HttpOnly
   * - Réponse contient uniquement les infos utilisateur et session
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    this.logger.info(
      this.i18n.t('auth.login_attempt', { email: loginDto.email }),
      {
        operation: 'AUTH_LOGIN',
        email: loginDto.email,
        rememberMe: loginDto.rememberMe,
        userAgent: request.headers['user-agent'],
        ip: this.extractClientIP(request),
      },
    );

    try {
      // 1. Validation de l'email
      const email = new Email(loginDto.email);

      // 2. Recherche de l'utilisateur
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        this.logger.warn(
          this.i18n.t('auth.user_not_found', { email: loginDto.email }),
          { operation: 'AUTH_LOGIN', email: loginDto.email },
        );
        throw new UnauthorizedException(
          this.i18n.t('auth.invalid_credentials'),
        );
      }

      // 3. Validation du mot de passe
      // const isPasswordValid = await this.passwordService.validatePassword(
      //   loginDto.password,
      //   user.passwordHash,
      // );
      // if (!isPasswordValid) {
      //   this.logger.warn(
      //     this.i18n.t('auth.invalid_password', { email: loginDto.email }),
      //     { operation: 'AUTH_LOGIN', email: loginDto.email },
      //   );
      //   throw new UnauthorizedException(this.i18n.t('auth.invalid_credentials'));
      // }

      // 4. Génération des tokens (mock pour le développement)
      const mockTokens = {
        accessToken: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
      };

      // 5. 🍪 Configuration des cookies sécurisés (responsabilité du contrôleur)
      this.setAuthCookies(response, mockTokens, loginDto.rememberMe);

      // 6. 📝 Réponse SRP : uniquement infos utilisateur et session (PAS de tokens)
      const loginResponse: LoginResponse = {
        user: {
          id: user.id,
          email: user.email.value,
          name: user.name,
          role: user.role,
        },
        session: {
          sessionId: `sess_${Date.now()}`,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 900 * 1000).toISOString(),
          deviceInfo: {
            userAgent: request.headers['user-agent'],
            ip: this.extractClientIP(request),
          },
        },
      };

      this.logger.info(
        this.i18n.t('auth.login_successful', { userId: user.id }),
        {
          operation: 'AUTH_LOGIN',
          userId: user.id,
          sessionId: loginResponse.session.sessionId,
        },
      );

      return loginResponse;
    } catch (error) {
      this.logger.error(
        this.i18n.t('auth.login_error', {
          email: loginDto.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        error as Error,
        {
          operation: 'AUTH_LOGIN',
          email: loginDto.email,
        },
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new BadRequestException(this.i18n.t('auth.login_failed'));
    }
  }

  /**
   * 🔄 REFRESH TOKEN - Renouvellement de l'access token
   *
   * Responsabilité unique : Gérer l'endpoint HTTP de refresh
   * - Nouveau token stocké dans cookie HttpOnly
   * - Réponse contient uniquement les infos utilisateur
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Body() refreshDto: RefreshDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): RefreshTokenResponse {
    this.logger.info(this.i18n.t('auth.refresh_attempt'), {
      operation: 'AUTH_REFRESH',
      userAgent: request.headers['user-agent'],
      ip: this.extractClientIP(request),
    });

    try {
      // 1. Extraction du refresh token depuis les cookies
      // const refreshToken = refreshDto.refreshToken ||
      //   this.authTokenService.extractTokenFromRequest(request, 'refresh');

      // 2. Validation et génération du nouveau token
      // const result = await this.authTokenService.refreshAccessToken(refreshToken);

      // 3. 🍪 Mise à jour du cookie access token uniquement
      const mockAccessToken = 'mock_new_access_token';
      this.setAccessTokenCookie(response, mockAccessToken, 900);

      // 4. 📝 Réponse SRP : uniquement infos utilisateur (PAS de token)
      const mockResponse: RefreshTokenResponse = {
        user: {
          id: 'mock_user_id',
          email: 'mock@example.com',
          name: 'Mock User',
          role: 'USER',
        },
      };

      this.logger.info(this.i18n.t('auth.refresh_successful'), {
        operation: 'AUTH_REFRESH',
        userId: mockResponse.user.id,
      });

      return mockResponse;
    } catch (error) {
      this.logger.error(
        this.i18n.t('auth.refresh_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        error as Error,
        {
          operation: 'AUTH_REFRESH',
        },
      );

      throw new UnauthorizedException(this.i18n.t('auth.refresh_failed'));
    }
  }

  /**
   * 🚪 LOGOUT - Déconnexion avec révocation des tokens
   *
   * Responsabilité unique : Gérer l'endpoint HTTP de logout
   * - Suppression des cookies d'authentification
   * - Message de confirmation simple
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(
    @Body() logoutDto: LogoutDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): { message: string } {
    this.logger.info(this.i18n.t('auth.logout_attempt'), {
      operation: 'AUTH_LOGOUT',
      logoutAll: logoutDto.logoutAll,
      userAgent: request.headers['user-agent'],
      ip: this.extractClientIP(request),
    });

    try {
      // 1. Révocation des tokens en base de données
      // const refreshToken = this.authTokenService.extractTokenFromRequest(request, 'refresh');
      // if (refreshToken) {
      //   await this.deviceSessionRepository.revokeByRefreshToken(refreshToken);
      // }

      // 2. 🧹 Suppression sécurisée des cookies
      this.clearAuthCookies(response);

      this.logger.info(this.i18n.t('auth.logout_successful'), {
        operation: 'AUTH_LOGOUT',
        logoutAll: logoutDto.logoutAll,
      });

      return {
        message: this.i18n.t('auth.logout_message'),
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('auth.logout_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        error as Error,
        {
          operation: 'AUTH_LOGOUT',
        },
      );

      throw new BadRequestException(this.i18n.t('auth.logout_failed'));
    }
  }

  /**
   * 👤 ME - Informations sur l'utilisateur connecté
   *
   * Responsabilité unique : Fournir les infos de l'utilisateur connecté
   * - Validation du token via cookies uniquement
   * - Réponse avec infos utilisateur
   */
  @Get('me')
  getCurrentUser(@Req() request: Request): {
    user: { id: string; email: string; name: string; role: string };
  } {
    this.logger.info(this.i18n.t('auth.fetch_user_info'), {
      operation: 'AUTH_ME',
      userAgent: request.headers['user-agent'],
      ip: this.extractClientIP(request),
    });

    try {
      // 1. Extraction et validation du token depuis les cookies
      // const accessToken = this.authTokenService.extractTokenFromRequest(request, 'access');
      // const payload = await this.authTokenService.validateToken(accessToken, 'access');
      // const user = await this.userRepository.findById(payload.sub);

      // Mock pour le développement
      const mockUser = {
        user: {
          id: 'mock_user_id',
          email: 'mock@example.com',
          name: 'Mock User',
          role: 'USER',
        },
      };

      this.logger.info(this.i18n.t('auth.user_info_fetched'), {
        operation: 'AUTH_ME',
        userId: mockUser.user.id,
      });

      return mockUser;
    } catch (error) {
      this.logger.error(
        this.i18n.t('auth.fetch_user_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
        }),
        error as Error,
        {
          operation: 'AUTH_ME',
        },
      );

      throw new UnauthorizedException(
        this.i18n.t('auth.authentication_required'),
      );
    }
  }

  /**
   * 🍪 MÉTHODES PRIVÉES - Gestion des cookies (responsabilité du contrôleur)
   */

  /**
   * Configuration des cookies d'authentification
   */
  private setAuthCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
    rememberMe?: boolean,
  ): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction
        ? this.configService.get<string>('COOKIE_DOMAIN')
        : undefined,
      path: '/',
    } as const;

    // Cookie access token (courte durée)
    response.cookie('auth_access_token', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Cookie refresh token (durée adaptative)
    const refreshMaxAge = rememberMe
      ? 7 * 24 * 60 * 60 * 1000 // 7 jours
      : 24 * 60 * 60 * 1000; // 1 jour

    response.cookie('auth_refresh_token', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: refreshMaxAge,
    });

    this.logger.debug(this.i18n.t('auth.cookies_configured'), {
      operation: 'SET_AUTH_COOKIES',
      rememberMe,
      isProduction,
    });
  }

  /**
   * Configuration du cookie access token uniquement
   */
  private setAccessTokenCookie(
    response: Response,
    accessToken: string,
    expiresIn: number,
  ): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    response.cookie('auth_access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction
        ? this.configService.get<string>('COOKIE_DOMAIN')
        : undefined,
      path: '/',
      maxAge: expiresIn * 1000,
    });

    this.logger.debug(this.i18n.t('auth.access_token_updated'), {
      operation: 'UPDATE_ACCESS_TOKEN_COOKIE',
      expiresIn,
      isProduction,
    });
  }

  /**
   * Suppression des cookies d'authentification
   */
  private clearAuthCookies(response: Response): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      domain: isProduction
        ? this.configService.get<string>('COOKIE_DOMAIN')
        : undefined,
      path: '/',
    } as const;

    response.clearCookie('auth_access_token', cookieOptions);
    response.clearCookie('auth_refresh_token', cookieOptions);

    this.logger.debug(this.i18n.t('auth.cookies_cleared'), {
      operation: 'CLEAR_AUTH_COOKIES',
      isProduction,
    });
  }

  /**
   * Extraction de l'IP client réelle
   */
  private extractClientIP(request: Request): string {
    return (
      (request.headers['cf-connecting-ip'] as string) ||
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}
