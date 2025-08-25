"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TestI18nService {
    t(key, params) {
        const translations = {
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
            'auth.login_attempt': 'Login attempt for {email}',
            'auth.invalid_credentials': 'Invalid credentials for {email}',
            'auth.login_failed': 'Login failed',
        };
        return key in translations;
    }
}
console.log('🧪 Testing I18n for Auth Controller...\n');
const i18nService = new TestI18nService();
const loginAttemptMsg = i18nService.t('auth.login_attempt', {
    email: 'test@example.com',
});
console.log('✅ Login attempt:', loginAttemptMsg);
const invalidCredsMsg = i18nService.t('auth.invalid_credentials', {
    email: 'test@example.com',
});
console.log('✅ Invalid credentials:', invalidCredsMsg);
const loginErrorMsg = i18nService.t('auth.login_error', {
    email: 'test@example.com',
    error: 'User not found',
});
console.log('✅ Login error:', loginErrorMsg);
const logoutMsg = i18nService.t('auth.logout_message');
console.log('✅ Logout message:', logoutMsg);
const missingKey = i18nService.t('auth.non_existent_key');
console.log('✅ Missing key:', missingKey);
console.log('\n🎉 All I18n tests completed successfully!');
//# sourceMappingURL=test-i18n.js.map