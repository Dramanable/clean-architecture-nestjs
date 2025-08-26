/**
 * 🎨 PRESENTATION MODULE - Module principal de la couche présentation
 *
 * Ce module coordonne tous les contrôleurs et suit la Clean Architecture
 * L'injection des dépendances se fait ici pour respecter l'architecture
 */

import { Module } from '@nestjs/common';
import type { I18nService } from '../application/ports/i18n.port';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { PinoLoggerModule } from '../infrastructure/logging/pino-logger.module';
import { TOKENS } from '../shared/constants/injection-tokens';
import { AuthController } from './controllers/auth.controller';
import { HealthController } from './controllers/health.controller';
import { TestController } from './controllers/test.controller';
import { UserController } from './controllers/user.controller';

/**
 * 🎭 Mock I18n Service temporaire
 */
class TemporaryI18nService implements I18nService {
  t(key: string, params?: Record<string, any>): string {
    const translations: Record<string, string> = {
      'success.user.created': 'User created successfully',
      'success.user.retrieved': 'User retrieved successfully',
      'operations.user.creation_attempt': 'User creation attempt',
      'operations.user.get_attempt': 'User get attempt',
      // Auth translations
      'auth.login_attempt': 'Tentative de connexion pour {email}',
      'auth.user_not_found': "Utilisateur non trouvé pour l'email {email}",
      'auth.invalid_credentials': 'Identifiants invalides pour {email}',
      'auth.login_successful': "Connexion réussie pour l'utilisateur {userId}",
      'auth.login_error': 'Erreur de connexion pour {email}: {error}',
      'auth.login_failed': 'Échec de la connexion',
      'auth.refresh_attempt': 'Token refresh attempt',
      'auth.refresh_successful': 'Token refreshed successfully',
      'auth.refresh_error': 'Token refresh error: {error}',
      'auth.refresh_failed': 'Token refresh failed',
      'auth.logout_attempt': 'Logout attempt',
      'auth.logout_successful': 'Logout successful',
      'auth.logout_error': 'Logout error: {error}',
      'auth.logout_failed': 'Logout failed',
      'auth.logout_message': 'You have been logged out successfully',
      'auth.fetch_user_info': 'Fetching user information',
      'auth.user_info_fetched': 'User information fetched successfully',
      'auth.fetch_user_error': 'Failed to fetch user information: {error}',
      'auth.authentication_required': 'Authentication required',
      'auth.cookies_configured': 'Authentication cookies configured',
      'auth.access_token_updated': 'Access token cookie updated',
      'auth.cookies_cleared': 'Authentication cookies cleared',
    };

    let result = translations[key] || key;

    // Simple parameter substitution
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }

    return result;
  }

  translate(key: string, params?: Record<string, any>): string {
    return this.t(key, params);
  }

  setDefaultLanguage(): void {
    // Mock implementation
  }

  exists(key: string): boolean {
    const translations: Record<string, string> = {
      'success.user.created': 'User created successfully',
      'success.user.retrieved': 'User retrieved successfully',
      'operations.user.creation_attempt': 'User creation attempt',
      'operations.user.get_attempt': 'User get attempt',
      // Auth translations
      'auth.login_attempt': 'Tentative de connexion pour {email}',
      'auth.user_not_found': "Utilisateur non trouvé pour l'email {email}",
      'auth.invalid_credentials': 'Identifiants invalides pour {email}',
      'auth.login_successful': "Connexion réussie pour l'utilisateur {userId}",
      'auth.login_error': 'Erreur de connexion pour {email}: {error}',
      'auth.login_failed': 'Échec de la connexion',
      'auth.refresh_attempt': 'Token refresh attempt',
      'auth.refresh_successful': 'Token refreshed successfully',
      'auth.refresh_error': 'Token refresh error: {error}',
      'auth.refresh_failed': 'Token refresh failed',
      'auth.logout_attempt': 'Logout attempt',
      'auth.logout_successful': 'Logout successful',
      'auth.logout_error': 'Logout error: {error}',
      'auth.logout_failed': 'Logout failed',
      'auth.logout_message': 'You have been logged out successfully',
      'auth.fetch_user_info': 'Fetching user information',
      'auth.user_info_fetched': 'User information fetched successfully',
      'auth.fetch_user_error': 'Failed to fetch user information: {error}',
      'auth.authentication_required': 'Authentication required',
      'auth.cookies_configured': 'Authentication cookies configured',
      'auth.access_token_updated': 'Access token cookie updated',
      'auth.cookies_cleared': 'Authentication cookies cleared',
    };
    return key in translations;
  }
}

@Module({
  imports: [
    // 🏗️ Import du module infrastructure (repositories, logging, etc.)
    InfrastructureModule,
    // 📝 Import du module de logging Pino
    PinoLoggerModule,
  ],
  controllers: [
    // 🎯 Tous les contrôleurs de l'application
    HealthController,
    UserController,
    AuthController,
    TestController, // Controller de test pour Swagger
  ],
  providers: [
    // 🌍 Services de la couche présentation
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: TemporaryI18nService,
    },
  ],
  exports: [
    // 🔄 Réexport pour utilisation dans app.module
    InfrastructureModule,
  ],
})
export class PresentationModule {}
