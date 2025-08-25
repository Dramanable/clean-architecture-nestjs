# 🐳 Docker Setup - Mode Développement Simple

Ce projet dispose maintenant d'un setup Docker simplifié pour le développement.

## 📁 Fichiers Docker créés

- **`Dockerfile.dev`** - Dockerfile optimisé pour le développement
- **`docker-compose.dev.yml`** - Configuration Docker Compose simplifiée
- **`.dockerignore.dev`** - Exclusions pour le contexte Docker

## 🚀 Démarrage rapide

### Option 1 : Docker Compose direct
```bash
# Démarrer l'environnement de développement
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f

# Arrêter
docker-compose -f docker-compose.dev.yml down
```

### Option 2 : Script automatisé (recommandé)
```bash
# Démarrer
./dev.sh start

# Voir les logs
./dev.sh logs

# Arrêter
./dev.sh stop

# Aide complète
./dev.sh help
```

## 🌐 URLs après démarrage

- **Application NestJS** : http://localhost:3000
- **pgAdmin (PostgreSQL)** : http://localhost:5050
  - Email : `dev@cleanarchi.com`
  - Mot de passe : `dev123`

## 🗄️ Base de données PostgreSQL

### Connexion directe
```bash
# Via Docker
docker-compose -f docker-compose.dev.yml exec postgres psql -U dev_user -d cleanarchi_dev

# Via pgAdmin (interface web)
# URL: http://localhost:5050
```

### Paramètres de connexion
- **Host** : `localhost` (ou `postgres` depuis l'app)
- **Port** : `5432`
- **Database** : `cleanarchi_dev`
- **Username** : `dev_user`
- **Password** : `dev_password123`

## 🔧 Commandes utiles

### Reconstruction de l'image
```bash
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Accès shell dans le container
```bash
docker-compose -f docker-compose.dev.yml exec app sh
```

### Nettoyage complet
```bash
docker-compose -f docker-compose.dev.yml down -v
docker system prune -f
```

### Debug Node.js
Le port `9229` est exposé pour le debugging Node.js via votre IDE.

## 📝 Variables d'environnement (Development)

Les variables sont configurées directement dans `docker-compose.dev.yml` :

```yaml
NODE_ENV: development
DB_HOST: postgres
DB_PORT: 5432
DB_USERNAME: dev_user
DB_PASSWORD: dev_password123
DB_DATABASE: cleanarchi_dev
ACCESS_TOKEN_SECRET: dev-access-token-secret-for-development-only-32chars
REFRESH_TOKEN_SECRET: dev-refresh-token-secret-for-development-only-32chars
BCRYPT_ROUNDS: 4  # Plus rapide en développement
```

## 🔄 Hot Reload

Le code source est monté en volume, donc toute modification est automatiquement prise en compte grâce à `nodemon`.

## 🛠️ Dépannage

### Problème de permissions
```bash
sudo chown -R $USER:$USER .
```

### Ports déjà utilisés
Vérifiez que les ports 3000 et 5432 ne sont pas utilisés :
```bash
lsof -i :3000
lsof -i :5432
```

### Reconstruire complètement
```bash
./dev.sh clean
./dev.sh rebuild
./dev.sh start
```

## 📊 Monitoring

### Logs en temps réel
```bash
./dev.sh logs
```

### Statistiques des containers
```bash
docker stats
```

### État des services
```bash
docker-compose -f docker-compose.dev.yml ps
```
