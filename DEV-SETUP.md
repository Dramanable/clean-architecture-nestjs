# 🚀 Setup de Développement Simple

## Démarrage Ultra-Rapide

```bash
# 1. Cloner le repo
git clone <votre-repo>
cd testingcleanarchi

# 2. Démarrer avec Docker
docker-compose -f docker-compose.dev.yml up -d

# 3. Accéder à l'application
open http://localhost:3000
```

## 🎯 URLs importantes

- **Application** : http://localhost:3000
- **pgAdmin** : http://localhost:5050 (dev@cleanarchi.com / dev123)
- **Health Check** : http://localhost:3000/health

## 🗄️ Base de données - Super Admin

Pour créer un super-admin dans la base de données :

```sql
-- Se connecter via pgAdmin ou psql
-- Database: cleanarchi_dev
-- User: dev_user / Password: dev_password123

INSERT INTO users (
    id, email, name, password, role, 
    "passwordChangeRequired", "isActive", "emailVerified", 
    "emailVerifiedAt", "loginAttempts", version, "createdAt", "updatedAt"
) VALUES (
    gen_random_uuid(),
    'admin@example.com',
    'Super Administrateur',
    '$2b$12$9RRsV6aNmLa9C4SY2zZthuwIXSKMZ8bfsckzfbmcXG2VShcoIr20q', -- Hash de "superadmin"
    'SUPER_ADMIN',
    false,
    true,
    true,
    NOW(),
    0,
    1,
    NOW(),
    NOW()
);
```

**Connexion :**
- Email : `admin@example.com`
- Mot de passe : `superadmin`

## ⚡ Commandes utiles

```bash
# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f

# Redémarrer l'app
docker-compose -f docker-compose.dev.yml restart app

# Shell dans le container
docker-compose -f docker-compose.dev.yml exec app sh

# Arrêter tout
docker-compose -f docker-compose.dev.yml down

# Nettoyage complet
docker-compose -f docker-compose.dev.yml down -v
```

## 🛠️ Développement local (sans Docker)

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer PostgreSQL avec Docker
docker-compose -f docker-compose.dev.yml up -d postgres pgadmin

# 3. Configurer les variables d'environnement
cp .env.dev.example .env.dev

# 4. Démarrer l'application
npm run start:dev
```

## 📁 Structure des fichiers Docker

- `Dockerfile.dev` - Image Docker optimisée pour le développement
- `docker-compose.dev.yml` - Configuration simple avec PostgreSQL + pgAdmin
- `.env.dev.example` - Variables d'environnement d'exemple
- `DOCKER-DEV.md` - Documentation détaillée

## 🧪 Tests

```bash
# Tests unitaires
npm run test:unit

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

## 📊 Monitoring

```bash
# Statistiques des containers
docker stats

# État des services
docker-compose -f docker-compose.dev.yml ps
```

C'est tout ! Votre environnement de développement est prêt en quelques commandes. 🎉
