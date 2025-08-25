# 🐳 Configuration Docker - Mode Développement

## ✅ Ce qui a été configuré

### 📁 Structure des Fichiers
```
├── Dockerfile                 # Multi-stage avec target development
├── docker-compose.yml         # Version originale (production)
├── docker-compose.dev.yml     # Configuration développement
├── .dockerignore             # Optimisation du contexte de build
├── .env.development          # Variables d'environnement dev
├── Makefile                  # Commandes Docker automatisées
├── dev.sh                    # Script de développement interactif
└── README.dev.md             # Guide de développement
```

### 🎯 Modes de Fonctionnement

#### 🔧 Mode Développement (Recommandé)
- **Hot reload** activé avec volumes montés
- **Debug port** 9229 exposé pour Node.js
- **VSCode debugger** port 24678
- **Mots de passe simples** pour le développement
- **Logs détaillés** avec DEBUG=*
- **BCRYPT_ROUNDS=4** pour performance

#### 🚀 Mode Production
- **Image optimisée** multi-stage
- **Utilisateur non-root** pour sécurité
- **Health checks** configurés
- **Secrets sécurisés** requis

### 🗄️ Services Configurés

#### 📊 PostgreSQL
- **Port**: 5432
- **User**: dev_user / dev_password123
- **Database**: cleanarchi_dev
- **Volume persistant**: postgres_dev_data

#### 🍃 MongoDB
- **Port**: 27017
- **User**: dev_user / dev_password123
- **Database**: cleanarchi_dev
- **Volume persistant**: mongodb_dev_data

#### 🔴 Redis
- **Port**: 6379
- **Password**: dev_password123
- **Volume persistant**: redis_dev_data

#### 🌐 Interfaces Web
- **pgAdmin**: http://localhost:5050 (dev@cleanarchi.com / dev123)
- **Mongo Express**: http://localhost:8081 (dev / dev)
- **Redis Commander**: http://localhost:8082

### 🚀 Commandes Rapides

```bash
# Démarrage complet avec Docker
./dev.sh docker
# ou
make start-build

# Démarrage bases de données seulement
make start-db
./dev.sh start

# Voir les logs
make logs
./dev.sh logs

# Tests
./dev.sh test
./dev.sh test unit

# Arrêt et nettoyage
make stop
./dev.sh clean
```

### 🔍 Debugging & Développement

#### 🐛 Debug Node.js
- **Port 9229** exposé pour Chrome DevTools
- **Port 24678** pour VSCode debugger
- Mode debug automatique avec `npm run start:debug`

#### 📊 Hot Reload
- Code source monté dans `/app`
- `node_modules` et `dist` en volumes anonymes
- Redémarrage automatique sur changement

#### 📝 Logs
- Format développement avec couleurs
- Niveau DEBUG activé
- Logs persistants dans `./logs`

### 🔧 Optimisations Développement

#### ⚡ Performance
- **BCRYPT_ROUNDS=4** (vs 12 en prod)
- **Cache Docker** pour node_modules
- **Health checks** moins fréquents

#### 🛡️ Sécurité Relaxée
- CORS permissif
- Rate limiting désactivé
- Mots de passe prévisibles
- Logs détaillés

### 📋 Variables d'Environnement

#### 🔐 Authentification
```
ACCESS_TOKEN_SECRET=dev-access-token-secret-for-development-only-32chars
REFRESH_TOKEN_SECRET=dev-refresh-token-secret-for-development-only-32chars
ACCESS_TOKEN_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION_DAYS=30
```

#### 🗄️ Bases de Données
```
DB_HOST=postgres (ou localhost sans Docker)
DB_USERNAME=dev_user
DB_PASSWORD=dev_password123
MONGODB_URL=mongodb://dev_user:dev_password123@mongodb:27017/cleanarchi_dev
REDIS_PASSWORD=dev_password123
```

### 🎮 Script Interactif (dev.sh)

Le script `dev.sh` offre une interface simplifiée :
- **start**: Mode développement sans Docker
- **docker**: Environnement complet Docker
- **test**: Différents types de tests
- **logs**: Affichage des logs par service
- **migrate**: Gestion des migrations
- **clean**: Nettoyage complet

### 🔄 Workflow de Développement

1. **Démarrage**: `./dev.sh docker`
2. **Développement**: Code avec hot reload
3. **Tests**: `./dev.sh test watch`
4. **Debug**: Attach debugger sur port 9229
5. **Logs**: `./dev.sh logs app`
6. **Arrêt**: `./dev.sh stop`

## 🚨 Notes Importantes

### ⚠️  Sécurité
- **NE PAS utiliser** ces configurations en production
- Mots de passe développement seulement
- Ports exposés pour faciliter le debug

### 🔧 Performance
- Images non optimisées pour la taille
- Outils de développement inclus
- Logs verbeux activés

### 📊 Monitoring
- Health checks adaptés au développement
- Métriques de debug disponibles
- Interfaces d'administration exposées

---

**🎯 Configuration optimisée pour un développement efficace avec Docker !** 🚀
