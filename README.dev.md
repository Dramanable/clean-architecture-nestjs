# 🚀 Guide de Développement - Clean Architecture NestJS

## 🎯 Démarrage Rapide

### 📋 Prérequis
- **Node.js** 22.17+
- **Docker** & **Docker Compose**
- **pnpm** (gestionnaire de paquets)

### ⚡ Démarrage Express

```bash
# 1. Cloner et installer
git clone <repo>
cd testingcleanarchi
pnpm install

# 2. Démarrer avec le script de développement
./dev.sh docker    # Avec Docker (recommandé)
# ou
./dev.sh start     # Sans Docker (bases de données requises)
```

## 🐳 Environnement Docker (Recommandé)

### 🚀 Configuration Complète
```bash
# Démarrer tout l'environnement
make start-build
# ou
./dev.sh docker

# Services disponibles:
# - Application NestJS: http://localhost:3000
# - pgAdmin: http://localhost:5050 (dev@cleanarchi.com / dev123)
# - Mongo Express: http://localhost:8081 (dev / dev)
# - Redis Commander: http://localhost:8082
```

### 🔧 Commandes Docker Utiles
```bash
# Voir les logs
make logs              # Tous les logs
make logs-app          # Logs de l'application
make logs-postgres     # Logs PostgreSQL

# Gestion des services
make stop              # Arrêter les services
make restart           # Redémarrer
make status            # Statut des services

# Entrer dans le conteneur
make shell             # Shell de l'application

# Nettoyage
make clean-volumes     # Supprimer les données
make clean-all         # Nettoyage complet
```

## 🛠️ Développement Local (Sans Docker)

### 📊 Bases de Données Requises
```bash
# Démarrer seulement les BD
make start-db

# Ou manuellement:
docker run -d --name postgres \
  -e POSTGRES_DB=cleanarchi_dev \
  -e POSTGRES_USER=dev_user \
  -e POSTGRES_PASSWORD=dev_password123 \
  -p 5432:5432 postgres:15-alpine

docker run -d --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=dev_user \
  -e MONGO_INITDB_ROOT_PASSWORD=dev_password123 \
  -p 27017:27017 mongo:7.0

docker run -d --name redis \
  -p 6379:6379 redis:7.2-alpine \
  redis-server --requirepass dev_password123
```

### 🚀 Démarrage de l'Application
```bash
# Mode développement avec hot reload
npm run start:dev

# Mode debug (avec debugger attaché)
npm run start:debug

# Avec le script
./dev.sh start
```

## 🧪 Tests

### 🔬 Types de Tests
```bash
# Tous les tests
npm test
./dev.sh test

# Tests unitaires seulement
npm run test:unit
./dev.sh test unit

# Tests d'intégration
npm run test:e2e
./dev.sh test e2e

# Mode watch
npm run test:watch
./dev.sh test watch

# Couverture de code
npm run test:coverage
./dev.sh test coverage
```

### 🎯 Tests TDD
```bash
# Mode TDD avec auto-refresh
npm run test:tdd
```

## 🗄️ Gestion des Données

### 📊 Migrations SQL (TypeORM)
```bash
# Créer une nouvelle migration
npm run migration:generate -- src/infrastructure/database/migrations/sql/AddNewColumn

# Exécuter les migrations
npm run migration:run
make migrate-sql

# Rollback
npm run migration:revert
make rollback-sql
```

### 🍃 Migrations NoSQL (MongoDB)
```bash
# Exécuter les migrations MongoDB
npm run migration:mongo:up
make migrate-nosql

# Rollback MongoDB
npm run migration:mongo:down
make rollback-nosql

# Créer une nouvelle migration MongoDB
# Créer un fichier dans: src/infrastructure/database/migrations/nosql/
```

## 🔧 Outils de Développement

### 📝 Linting & Formatage
```bash
# Linter automatique
npm run lint
./dev.sh lint

# Formatage du code
npm run format
```

### 🏗️ Build & Production
```bash
# Build de l'application
npm run build
./dev.sh build

# Démarrage en mode production
npm run start:prod
```

## 🌍 Variables d'Environnement

### 📋 Fichiers de Configuration
- `.env.development` - Configuration de développement
- `.env.test` - Configuration pour les tests
- `.env.production` - Configuration de production

### 🔐 Variables Importantes (Développement)
```bash
NODE_ENV=development
DB_HOST=localhost
DB_USERNAME=dev_user
DB_PASSWORD=dev_password123
MONGODB_URL=mongodb://dev_user:dev_password123@localhost:27017/cleanarchi_dev
REDIS_PASSWORD=dev_password123
```

## 🎯 Fonctionnalités de Développement

### 🔍 Debug
- **Port Debug**: `9229` (attaché automatiquement)
- **VSCode Debug**: Configuration disponible dans `.vscode/launch.json`
- **Chrome DevTools**: `chrome://inspect`

### 📊 Monitoring
- **Health Check**: `http://localhost:3000/health`
- **Swagger API**: `http://localhost:3000/api` (si activé)
- **Métriques**: Intégrées dans l'application

### 🔄 Hot Reload
- **Frontend**: Auto-refresh activé
- **Backend**: Nodemon configuré
- **Tests**: Mode watch disponible

## 🚨 Dépannage

### ❗ Problèmes Courants
```bash
# Port déjà utilisé
sudo lsof -i :3000
kill -9 <PID>

# Problèmes de permissions Docker
sudo chown -R $USER:$USER ~/.docker

# Reset complet de l'environnement
./dev.sh reset
```

### 🔍 Logs & Debug
```bash
# Logs détaillés
DEBUG=* npm run start:dev

# Logs Docker
docker-compose -f docker-compose.dev.yml logs -f

# Vérifier la santé des services
./dev.sh status
```

## 📚 Documentation

### 🔗 Liens Utiles
- **Architecture**: `docs/ARCHITECTURE.md`
- **API Documentation**: `http://localhost:3000/api`
- **Database Schema**: `docs/DATABASE.md`

### 🎨 Structure du Projet
```
src/
├── domain/              # Entités et logique métier
├── application/         # Services applicatifs
├── infrastructure/      # Implémentations techniques
└── presentation/        # Controllers et DTOs
```

---

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Commit** les changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir** une Pull Request

---

**🚀 Happy Coding!** 🎉
