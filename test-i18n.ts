/**
 * 🧪 Script de test pour l'i18n du contrôleur Auth
 */

import { I18nService } from './src/application/ports/i18n.port';

// Simulation du service I18n comme dans presentation.module.ts
class TestI18nService implements I18nService {
  t(key: string, params?: Record<string, any>): string {
    const translations: Record<string, string> = {
      'auth.login_attempt': 'Login attempt for {email}',
      'auth.user_not_found': 'User not found for email {email}',
      'auth.invalid_credentials': 'Invalid credentials for {email}',
      'auth.login_successful': 'Login successful for user {userId}',
      'auth.login_error': 'Login error for {email}: {error}',
      'auth.login_failed': 'Login failed',
      'auth.refresh_attempt': 'Token refresh attempt',
      'auth.refresh_successful': 'Token refreshed successfully',
      'auth.logout_message': 'You have been logged out successfully',
      'auth.authentication_required': 'Authentication required',
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
      'auth.login_attempt': 'Login attempt for {email}',
      'auth.invalid_credentials': 'Invalid credentials for {email}',
      'auth.login_failed': 'Login failed',
    };
    return key in translations;
  }
}

// Tests
console.log('🧪 Testing I18n for Auth Controller...\n');

const i18nService = new TestI18nService();

// Test 1: Login attempt message
const loginAttemptMsg = i18nService.t('auth.login_attempt', {
  email: 'test@example.com',
});
console.log('✅ Login attempt:', loginAttemptMsg);

// Test 2: Invalid credentials message
const invalidCredsMsg = i18nService.t('auth.invalid_credentials', {
  email: 'test@example.com',
});
console.log('✅ Invalid credentials:', invalidCredsMsg);

// Test 3: Login error message
const loginErrorMsg = i18nService.t('auth.login_error', {
  email: 'test@example.com',
  error: 'User not found',
});
console.log('✅ Login error:', loginErrorMsg);

// Test 4: Simple message without params
const logoutMsg = i18nService.t('auth.logout_message');
console.log('✅ Logout message:', logoutMsg);

// Test 5: Missing key (should return key itself)
const missingKey = i18nService.t('auth.non_existent_key');
console.log('✅ Missing key:', missingKey);

console.log('\n🎉 All I18n tests completed successfully!');
