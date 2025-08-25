export declare const authMessages: {
    readonly 'auth.login_attempt': {
        readonly fr: "Tentative de connexion pour {email}";
        readonly en: "Login attempt for {email}";
    };
    readonly 'auth.login_successful': {
        readonly fr: "Connexion réussie pour {userId} ({email})";
        readonly en: "Successful login for {userId} ({email})";
    };
    readonly 'auth.login_failed': {
        readonly fr: "Échec de connexion pour {email}: {error}";
        readonly en: "Login failed for {email}: {error}";
    };
    readonly 'auth.invalid_credentials': {
        readonly fr: "Email ou mot de passe incorrect";
        readonly en: "Invalid email or password";
    };
    readonly 'auth.login_error': {
        readonly fr: "Erreur lors de la connexion";
        readonly en: "Login error";
    };
    readonly 'auth.refresh_attempt': {
        readonly fr: "Tentative de renouvellement du token";
        readonly en: "Token refresh attempt";
    };
    readonly 'auth.refresh_successful': {
        readonly fr: "Token renouvelé avec succès";
        readonly en: "Token refreshed successfully";
    };
    readonly 'auth.refresh_failed': {
        readonly fr: "Échec du renouvellement du token: {error}";
        readonly en: "Token refresh failed: {error}";
    };
    readonly 'auth.refresh_token_missing': {
        readonly fr: "Token de renouvellement manquant";
        readonly en: "Refresh token missing";
    };
    readonly 'auth.invalid_refresh_token': {
        readonly fr: "Token de renouvellement invalide";
        readonly en: "Invalid refresh token";
    };
    readonly 'auth.refresh_error': {
        readonly fr: "Erreur lors du renouvellement du token";
        readonly en: "Token refresh error";
    };
    readonly 'auth.logout_attempt': {
        readonly fr: "Tentative de déconnexion";
        readonly en: "Logout attempt";
    };
    readonly 'auth.logout_successful': {
        readonly fr: "Déconnexion réussie";
        readonly en: "Logout successful";
    };
    readonly 'auth.logout_failed': {
        readonly fr: "Échec de la déconnexion: {error}";
        readonly en: "Logout failed: {error}";
    };
    readonly 'auth.logout_success': {
        readonly fr: "Vous avez été déconnecté avec succès";
        readonly en: "You have been logged out successfully";
    };
    readonly 'auth.logout_error': {
        readonly fr: "Erreur lors de la déconnexion";
        readonly en: "Logout error";
    };
    readonly 'auth.me_attempt': {
        readonly fr: "Récupération des informations utilisateur";
        readonly en: "Fetching user information";
    };
    readonly 'auth.me_successful': {
        readonly fr: "Informations utilisateur récupérées avec succès";
        readonly en: "User information fetched successfully";
    };
    readonly 'auth.me_failed': {
        readonly fr: "Échec de récupération des informations utilisateur: {error}";
        readonly en: "Failed to fetch user information: {error}";
    };
    readonly 'auth.user_not_found': {
        readonly fr: "Utilisateur non trouvé";
        readonly en: "User not found";
    };
    readonly 'auth.authentication_required': {
        readonly fr: "Authentification requise";
        readonly en: "Authentication required";
    };
    readonly 'auth.tokens_generated': {
        readonly fr: "Tokens générés pour l'utilisateur {userId}, session {sessionId}";
        readonly en: "Tokens generated for user {userId}, session {sessionId}";
    };
    readonly 'auth.access_token_refreshed': {
        readonly fr: "Token d'accès renouvelé pour l'utilisateur {userId}";
        readonly en: "Access token refreshed for user {userId}";
    };
    readonly 'auth.token_validation_failed': {
        readonly fr: "Échec de validation du token {tokenType}: {error}";
        readonly en: "Token validation failed for {tokenType}: {error}";
    };
    readonly 'auth.access_token_missing': {
        readonly fr: "Token d'accès manquant";
        readonly en: "Access token missing";
    };
    readonly 'auth.invalid_access_token': {
        readonly fr: "Token d'accès invalide";
        readonly en: "Invalid access token";
    };
    readonly 'auth.cookies_set': {
        readonly fr: "Cookies d'authentification configurés pour l'environnement {environment}";
        readonly en: "Authentication cookies set for {environment} environment";
    };
    readonly 'auth.cookies_cleared': {
        readonly fr: "Cookies d'authentification supprimés pour l'environnement {environment}";
        readonly en: "Authentication cookies cleared for {environment} environment";
    };
    readonly 'auth.security_context_created': {
        readonly fr: "Contexte de sécurité créé pour la requête {requestId}";
        readonly en: "Security context created for request {requestId}";
    };
    readonly 'auth.session_created': {
        readonly fr: "Session créée pour l'utilisateur {userId}, appareil {deviceId}";
        readonly en: "Session created for user {userId}, device {deviceId}";
    };
    readonly 'auth.session_revoked': {
        readonly fr: "Session révoquée pour l'utilisateur {userId}: {reason}";
        readonly en: "Session revoked for user {userId}: {reason}";
    };
    readonly 'auth.suspicious_activity': {
        readonly fr: "Activité suspecte détectée pour l'utilisateur {userId}";
        readonly en: "Suspicious activity detected for user {userId}";
    };
    readonly 'auth.multiple_login_attempts': {
        readonly fr: "Multiples tentatives de connexion pour {email}";
        readonly en: "Multiple login attempts for {email}";
    };
    readonly 'auth.ip_address_changed': {
        readonly fr: "Changement d'adresse IP détecté pour l'utilisateur {userId}";
        readonly en: "IP address change detected for user {userId}";
    };
    readonly 'auth.device_changed': {
        readonly fr: "Changement d'appareil détecté pour l'utilisateur {userId}";
        readonly en: "Device change detected for user {userId}";
    };
    readonly 'auth.dev_mode_warning': {
        readonly fr: "Mode développement: sécurité réduite activée";
        readonly en: "Development mode: reduced security enabled";
    };
    readonly 'auth.production_mode_active': {
        readonly fr: "Mode production: sécurité maximale activée";
        readonly en: "Production mode: maximum security enabled";
    };
};
export type AuthMessageKey = keyof typeof authMessages;
