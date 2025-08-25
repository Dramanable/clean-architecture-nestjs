# 🔐 Configuration des Tokens - Variables d'Environnement

## 📋 Résumé des Modifications

Nous avons implémenté un système de configuration flexible pour les durées et secrets des tokens d'authentification via les variables d'environnement.

## 🎯 Variables d'Environnement Configurables

### 🕒 Durées des Tokens

| Variable | Description | Valeur par Défaut | Exemple Production | Exemple Test |
|----------|-------------|-------------------|-------------------|--------------|
| `ACCESS_TOKEN_EXPIRATION` | Durée de validité de l'access token (en secondes) | 3600 (1h) | 900 (15min) | 300 (5min) |
| `REFRESH_TOKEN_EXPIRATION_DAYS` | Durée de validité du refresh token (en jours) | 30 | 7 | 1 |

### 🔑 Secrets et Algorithmes

| Variable | Description | Valeur par Défaut | Notes de Sécurité |
|----------|-------------|-------------------|-------------------|
| `ACCESS_TOKEN_SECRET` | Secret pour signer les access tokens | ❌ **REQUIS** | Min 32 caractères |
| `REFRESH_TOKEN_SECRET` | Secret pour signer les refresh tokens | ❌ **REQUIS** | Min 32 caractères, différent d'ACCESS |
| `ACCESS_TOKEN_ALGORITHM` | Algorithme de signature access token | HS256 | HS256, HS384, HS512, RS256... |
| `REFRESH_TOKEN_ALGORITHM` | Algorithme de signature refresh token | HS256 | HS256, HS384, HS512, RS256... |

### 🔐 Configuration des Mots de Passe

| Variable | Description | Valeur par Défaut | Recommandations |
|----------|-------------|-------------------|-----------------|
| `PASSWORD_HASH_ALGORITHM` | Algorithme de hachage | bcrypt | Utiliser bcrypt |
| `BCRYPT_ROUNDS` | Nombre de rounds bcrypt | 12 | Prod: 12-15, Dev: 10, Test: 8 |

### 🏷️ Configuration JWT

| Variable | Description | Valeur par Défaut |
|----------|-------------|-------------------|
| `JWT_ISSUER` | Émetteur des tokens JWT | clean-arch-app |
| `JWT_AUDIENCE` | Audience des tokens JWT | clean-arch-users |

## 🚀 Utilisation

### 1. Copier le fichier d'exemple
```bash
cp .env.example .env
```

### 2. Configurer les secrets (OBLIGATOIRE)
```bash
# Générer des secrets sécurisés (min 32 caractères)
ACCESS_TOKEN_SECRET=your-super-secret-access-token-key-min-32-chars-long
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-min-32-chars-different
```

### 3. Ajuster les durées selon l'environnement

#### 🏗️ Développement
```bash
ACCESS_TOKEN_EXPIRATION=3600      # 1 heure
REFRESH_TOKEN_EXPIRATION_DAYS=30  # 30 jours
BCRYPT_ROUNDS=10                  # Plus rapide
```

#### 🏭 Production
```bash
ACCESS_TOKEN_EXPIRATION=900       # 15 minutes (plus sécurisé)
REFRESH_TOKEN_EXPIRATION_DAYS=7   # 7 jours (plus sécurisé)
BCRYPT_ROUNDS=12                  # Plus sécurisé
```

#### 🧪 Tests
```bash
ACCESS_TOKEN_EXPIRATION=300       # 5 minutes
REFRESH_TOKEN_EXPIRATION_DAYS=1   # 1 jour
BCRYPT_ROUNDS=8                   # Plus rapide
```

## ⚠️ Points de Sécurité Importants

### 🔒 Secrets Obligatoires
- `ACCESS_TOKEN_SECRET` et `REFRESH_TOKEN_SECRET` sont **obligatoires**
- Doivent faire **minimum 32 caractères** chacun
- Doivent être **différents** l'un de l'autre
- Utilisez un générateur de secrets cryptographiquement sûr

### 🔄 Rotation des Secrets
- En production, rotez régulièrement les secrets
- Utilisez un gestionnaire de secrets (AWS Secrets Manager, Azure Key Vault...)
- Ne commitez **JAMAIS** les vrais secrets dans le code

### ⏰ Durées Recommandées
- **Access Token** : Court (15min-1h) pour limiter l'exposition
- **Refresh Token** : Plus long (7-30 jours) mais révoquer en cas de compromission
- Ajustez selon votre politique de sécurité

## 🧪 Tests

Les tests vérifient automatiquement :
- ✅ Utilisation des valeurs par défaut
- ✅ Lecture des variables d'environnement
- ✅ Validation des secrets (longueur, différence)
- ✅ Validation des rounds bcrypt
- ✅ Configuration par environnement

```bash
npm test  # 97 tests passent ✅
```

## 🏗️ Implémentation Technique

### Interface de Configuration
```typescript
interface IConfigService {
  getAccessTokenExpirationTime(): number;
  getRefreshTokenExpirationDays(): number;
  getAccessTokenSecret(): string;
  getRefreshTokenSecret(): string;
  // ... autres méthodes
}
```

### Service de Configuration
- **`AppConfigService`** : Implémentation production avec `process.env`
- **`MockConfigService`** : Implémentation test avec valeurs configurables
- Validation automatique des configurations au démarrage

### Utilisation dans LoginUseCase
```typescript
// Durées configurables
const expiresIn = this.config.getAccessTokenExpirationTime();
const refreshDays = this.config.getRefreshTokenExpirationDays();

// Secrets configurables
const accessToken = this.tokenService.generateAccessToken(
  userId, email, role,
  this.config.getAccessTokenSecret(),
  expiresIn,
  this.config.getAccessTokenAlgorithm()
);
```

## 📚 Fichiers Modifiés

- ✅ `src/application/ports/config.port.ts` - Interface de configuration
- ✅ `src/infrastructure/config/app-config.service.ts` - Service production
- ✅ `tests/unit/mocks/config.service.mock.ts` - Service mock pour tests
- ✅ `src/application/use-cases/users/login.use-case.ts` - Utilisation config
- ✅ `.env.example` - Exemple de configuration
- ✅ `tests/unit/config/config.test.ts` - Tests de configuration

**Configuration des tokens maintenant 100% configurable via variables d'environnement ! 🎉**
