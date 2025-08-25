# 🚀 NestJS Clean Architecture - Guide de démarrage

## 🔧 Prérequis

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

## 🐘 Configuration Base de données

### Démarrage avec Docker Compose

```bash
# Démarrer PostgreSQL, Redis et pgAdmin4
npm run docker:up

# Vérifier que les services sont en cours
npm run docker:ps

# Vérifier la santé des services
npm run docker:health

# Voir les logs
npm run docker:logs
```

### Variables d'environnement

Copiez `.env.example` vers `.env` ou utilisez la configuration existante:

```bash
# Database
DATABASE_TYPE=postgresql
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=admin
DATABASE_PASSWORD=password123
DATABASE_NAME=cleanarchi

# JWT Secrets (CHANGEZ CES VALEURS EN PRODUCTION)
ACCESS_TOKEN_SECRET=super-secret-access-token-that-is-32-chars-long-at-least
REFRESH_TOKEN_SECRET=different-super-secret-refresh-token-32-chars-long-minimum
```

## 🚀 Démarrage de l'application

### Méthode 1: Démarrage complet automatique

```bash
npm run dev:full
```

### Méthode 2: Démarrage manuel

```bash
# 1. Démarrer les services Docker
npm run docker:up

# 2. Attendre que PostgreSQL soit prêt (30 secondes)
sleep 30

# 3. Démarrer l'application
npm run start:dev
```

### Méthode 3: Sans Docker (PostgreSQL local)

```bash
# Si vous avez PostgreSQL installé localement
npm run start:dev
```

## 📊 Vérification

Une fois l'application démarrée, vous devriez voir:

```
[Bootstrap] 🌍 Environment: development
[Bootstrap] 🔧 Configuration loaded successfully
[Bootstrap] 📝 Development mode: Enhanced logging enabled
[Bootstrap] 🔓 Development mode: Relaxed security policies
[Bootstrap] 🚀 Application running on http://0.0.0.0:3000
[Bootstrap] 🔗 API Base URL: http://0.0.0.0:3000/api/v1
[Bootstrap] 💊 Health Check: http://0.0.0.0:3000/health
[Bootstrap] 📚 API Documentation: http://0.0.0.0:3000/api/docs
[Bootstrap] ✅ Application started successfully
```

## 🔗 URLs importantes

- **API Base**: http://localhost:3000/api/v1
- **Swagger Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health
- **pgAdmin4**: http://localhost:5050
  - Email: `admin@cleanarchi.com`
  - Password: `admin123`
  - Serveur PostgreSQL pré-configuré

## 🛠️ Middlewares activés

### 🔒 Sécurité

- **CORS**: Origines autorisées pour développement
- **Helmet**: En-têtes de sécurité configurés
- **Content Security Policy**: Politiques adaptées à l'environnement

### ⚡ Performance

- **Compression**: Compression gzip/deflate automatique
- **Body Parser**: Limites configurées (50MB)
- **Trust Proxy**: Activé en production

### 🎯 Validation

- **Global Validation Pipe**: Transformation et validation automatique
- **DTO Validation**: Validation complète des requêtes/réponses

## 🧪 Tests

```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests TDD
npm run test:tdd
```

## 🐛 Dépannage

### Docker non disponible

Si Docker n'est pas configuré dans WSL:

1. Installez Docker Desktop
2. Activez l'intégration WSL dans les paramètres Docker Desktop
3. Redémarrez WSL

### PostgreSQL non accessible

```bash
# Vérifier que PostgreSQL est en cours
npm run docker:ps

# Redémarrer les services
npm run docker:down
npm run docker:up
```

### Erreurs de connexion

- Vérifiez que les ports 5432 et 6379 ne sont pas utilisés
- Attendez que PostgreSQL soit complètement démarré (~30 secondes)
- Vérifiez les logs avec `npm run docker:logs`
