/**
 * 🛡️ GLOBAL AUTH GUARD - Guard d'authentification globale avec cookies
 *
 * Guard qui vérifie l'authentification JWT depuis les cookies
 * et gère les sessions utilisateur Redis
 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import type { IUserSessionService } from '../../application/ports/user-session.port';
import type { ICookieService } from '../../application/ports/cookie.port';
import type { Logger } from '../../application/ports/logger.port';
import type { I18nService } from '../../application/ports/i18n.port';
import { TOKENS } from '../../shared/constants/injection-tokens';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class GlobalAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    @Inject(TOKENS.USER_SESSION_SERVICE)
    private readonly userSessionService: IUserSessionService,
    @Inject(TOKENS.COOKIE_SERVICE)
    private readonly cookieService: ICookieService,
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 🔓 Vérifier si la route est publique
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.debug(this.i18n.t('auth.public_route_accessed'));
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    try {
      // 🍪 Extraire le token depuis les cookies
      const token = this.extractTokenFromCookies(request);

      if (!token) {
        this.logger.warn(this.i18n.t('auth.token_missing'), {
          ip: request.ip,
          userAgent: request.get('User-Agent'),
        });
        throw new UnauthorizedException(this.i18n.t('auth.token_required'));
      }

      // 🔍 Vérifier et décoder le JWT
      const payload = await this.verifyToken(token);

      // 👤 Vérifier la session utilisateur dans Redis
      const user = await this.userSessionService.getUserSession(payload.sub);

      if (!user) {
        this.logger.warn(this.i18n.t('auth.session_not_found'), {
          userId: payload.sub,
          ip: request.ip,
        });
        throw new UnauthorizedException(this.i18n.t('auth.session_expired'));
      }

      // ♻️ Rafraîchir la session
      await this.userSessionService.refreshUserSession(payload.sub);

      // 📎 Attacher l'utilisateur à la requête
      request['user'] = user;
      request['userId'] = payload.sub;

      this.logger.debug(this.i18n.t('auth.user_authenticated'), {
        userId: payload.sub,
        email: user.email.value,
        role: user.role,
      });

      return true;
    } catch (error) {
      this.logger.error(
        this.i18n.t('auth.authentication_failed'),
        error as Error,
        {
          ip: request.ip,
          userAgent: request.get('User-Agent'),
        },
      );

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException(this.i18n.t('auth.invalid_token'));
    }
  }

  /**
   * 🍪 Extrait le token JWT depuis les cookies
   */
  private extractTokenFromCookies(request: Request): string | null {
    const cookieName = this.configService.get<string>(
      'ACCESS_TOKEN_COOKIE_NAME',
      'access_token',
    );
    return this.cookieService.getCookie(request, cookieName) || null;
  }

  /**
   * 🔍 Vérifie et décode le token JWT
   */
  private async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const secret = this.configService.get<string>('ACCESS_TOKEN_SECRET');
      return await this.jwtService.verifyAsync(token, { secret });
    } catch (error) {
      this.logger.debug(this.i18n.t('auth.token_verification_failed'), {
        error: (error as Error).message,
      });
      throw new UnauthorizedException(this.i18n.t('auth.invalid_token'));
    }
  }
}
