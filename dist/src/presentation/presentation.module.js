"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresentationModule = void 0;
const common_1 = require("@nestjs/common");
const infrastructure_module_1 = require("../infrastructure/infrastructure.module");
const pino_logger_module_1 = require("../infrastructure/logging/pino-logger.module");
const injection_tokens_1 = require("../shared/constants/injection-tokens");
const user_controller_1 = require("./controllers/user.controller");
class TemporaryI18nService {
    t(key, params) {
        const translations = {
            'success.user.created': 'User created successfully',
            'success.user.retrieved': 'User retrieved successfully',
            'operations.user.creation_attempt': 'User creation attempt',
            'operations.user.get_attempt': 'User get attempt',
            'auth.login_attempt': 'Login attempt for {email}',
            'auth.user_not_found': 'User not found for email {email}',
            'auth.invalid_credentials': 'Invalid credentials for {email}',
            'auth.login_successful': 'Login successful for user {userId}',
            'auth.login_error': 'Login error for {email}: {error}',
            'auth.login_failed': 'Login failed',
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
        if (params) {
            Object.keys(params).forEach((paramKey) => {
                result = result.replace(`{${paramKey}}`, String(params[paramKey]));
            });
        }
        return result;
    }
    translate(key, params) {
        return this.t(key, params);
    }
    setDefaultLanguage() {
    }
    exists(key) {
        const translations = {
            'success.user.created': 'User created successfully',
            'success.user.retrieved': 'User retrieved successfully',
            'operations.user.creation_attempt': 'User creation attempt',
            'operations.user.get_attempt': 'User get attempt',
            'auth.login_attempt': 'Login attempt for {email}',
            'auth.user_not_found': 'User not found for email {email}',
            'auth.invalid_credentials': 'Invalid credentials for {email}',
            'auth.login_successful': 'Login successful for user {userId}',
            'auth.login_error': 'Login error for {email}: {error}',
            'auth.login_failed': 'Login failed',
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
let PresentationModule = class PresentationModule {
};
exports.PresentationModule = PresentationModule;
exports.PresentationModule = PresentationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            infrastructure_module_1.InfrastructureModule,
            pino_logger_module_1.PinoLoggerModule,
        ],
        controllers: [
            user_controller_1.UserController,
        ],
        providers: [
            {
                provide: injection_tokens_1.TOKENS.I18N_SERVICE,
                useClass: TemporaryI18nService,
            },
        ],
        exports: [
            infrastructure_module_1.InfrastructureModule,
        ],
    })
], PresentationModule);
//# sourceMappingURL=presentation.module.js.map