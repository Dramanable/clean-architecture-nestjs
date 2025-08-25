/**
 * 🔑 JwtTokenService - TDD GREEN Phase
 *
 * Service JWT pour génération et vérification des tokens
 */

import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { TOKENS } from '../../shared/constants/injection-tokens';
import type { Logger } from '../../application/ports/logger.port';
import type { I18nService } from '../../application/ports/i18n.port';

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
  ) {}

  generateAccessToken(
    userId: string,
    email: string,
    role: string,
    secret: string,
    expiresIn: number,
  ): string {
    const context = {
      operation: 'GENERATE_ACCESS_TOKEN',
      timestamp: new Date().toISOString(),
      userId,
    };

    this.logger.info(
      this.i18n.t('operations.token.generate_access_attempt'),
      context,
    );

    try {
      const payload = {
        sub: userId,
        email,
        role,
        type: 'access',
      };

      const token = this.jwtService.sign(payload, {
        secret,
        expiresIn,
      });

      this.logger.info(
        this.i18n.t('operations.token.generate_access_success'),
        { ...context, expiresIn },
      );

      return token;
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.token.generate_access_failed'),
        error as Error,
        context,
      );
      throw error;
    }
  }

  generateRefreshToken(secret: string): string {
    const context = {
      operation: 'GENERATE_REFRESH_TOKEN',
      timestamp: new Date().toISOString(),
    };

    this.logger.info(
      this.i18n.t('operations.token.generate_refresh_attempt'),
      context,
    );

    try {
      // Génération d'un token sécurisé avec crypto.randomBytes
      const randomData = randomBytes(32);
      const token = randomData.toString('hex');

      this.logger.info(
        this.i18n.t('operations.token.generate_refresh_success'),
        { ...context, tokenLength: token.length },
      );

      return token;
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.token.generate_refresh_failed'),
        error as Error,
        context,
      );
      throw error;
    }
  }

  verifyToken(token: string, secret: string): any {
    const context = {
      operation: 'VERIFY_TOKEN',
      timestamp: new Date().toISOString(),
    };

    this.logger.info(
      this.i18n.t('operations.token.verify_attempt'),
      context,
    );

    try {
      const payload = this.jwtService.verify(token, { secret });

      this.logger.info(
        this.i18n.t('operations.token.verify_success'),
        { ...context, userId: payload.sub },
      );

      return payload;
    } catch (error) {
      this.logger.warn(
        this.i18n.t('warnings.token.verify_failed'),
        { ...context, error: (error as Error).message },
      );
      throw error;
    }
  }
}
