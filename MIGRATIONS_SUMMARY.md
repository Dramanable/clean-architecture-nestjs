# 🎯 Migrations TypeORM - Configuration Complète

## ✅ Ce qui a été mis en place

### 🏗️ **Structure des Entités TypeORM**

```
src/infrastructure/database/entities/typeorm/
├── user.entity.ts           # 👤 Table users complète
└── refresh-token.entity.ts  # 🔑 Table refresh_tokens
```

**Rôle des entités TypeORM** :

- ✅ **Mapping ORM** : Définissent la structure des tables PostgreSQL
- ✅ **Génération de migrations** : TypeORM les utilise pour créer les migrations
- ✅ **Validation de schéma** : Assurent la cohérence code ↔ base de données
- ✅ **Synchronisation automatique** : En développement uniquement

### 🔄 **Système de Migrations TypeScript**

#### Configuration créée :

- ✅ **`typeorm.config.ts`** : Configuration DataSource pour migrations
- ✅ **Migration initiale** : `1692970800000-CreateInitialTables.ts`
- ✅ **Scripts npm** : Commandes pour gérer les migrations
- ✅ **Script de setup** : Initialisation automatique de la DB

#### Commandes disponibles :

```bash
# 🔄 Gestion des migrations
npm run migration:generate -- src/infrastructure/database/migrations/MigrationName
npm run migration:create -- src/infrastructure/database/migrations/CustomMigration
npm run migration:run        # Appliquer les migrations
npm run migration:revert     # Annuler la dernière migration
npm run migration:show       # Afficher le statut

# 🗄️ Base de données
npm run db:setup            # Setup complet de la DB
npm run db:reset            # Reset + migrations
npm run schema:drop         # Supprimer tout (DEV)
npm run schema:sync         # Sync automatique (DEV)
```

### 📊 **Table `users` créée** avec tous les champs :

```sql
users:
├── id                      (uuid, PK)
├── email                   (varchar, unique)
├── name                    (varchar)
├── password                (varchar)
├── passwordChangeRequired  (boolean) ← 🆕 Ajouté
├── role                    (enum: USER|MANAGER|SUPER_ADMIN)
├── isActive                (boolean)
├── lastLoginAt             (timestamp)
├── lastLoginIp             (varchar)
├── loginAttempts           (integer)
├── lockedUntil             (timestamp)
├── emailVerified           (boolean)
├── emailVerificationToken  (varchar)
├── passwordResetToken      (varchar)
├── passwordResetExpires    (timestamp)
├── tenantId                (varchar)
├── metadata                (jsonb)
├── createdAt               (timestamp)
├── updatedAt               (timestamp, auto-update)
└── version                 (integer, optimistic locking)
```

### 🔑 **Table `refresh_tokens` créée** :

```sql
refresh_tokens:
├── id            (uuid, PK)
├── userId        (uuid, FK → users.id)
├── tokenHash     (text)
├── expiresAt     (timestamp)
├── isRevoked     (boolean)
├── deviceId      (varchar)
├── userAgent     (varchar)
├── ipAddress     (inet)
├── lastUsedAt    (timestamp)
├── createdAt     (timestamp)
├── updatedAt     (timestamp, auto-update)
├── revokedAt     (timestamp)
└── revokedReason (varchar)
```

### 🎯 **Index de performance créés** :

```sql
-- Table users
IDX_USER_EMAIL       (email) UNIQUE
IDX_USER_ROLE        (role)
IDX_USER_CREATED_AT  (createdAt)
IDX_USER_TENANT_ID   (tenantId)

-- Table refresh_tokens
IDX_REFRESH_TOKEN_USER_ID    (userId)
IDX_REFRESH_TOKEN_EXPIRES_AT (expiresAt)
IDX_REFRESH_TOKEN_DEVICE_ID  (deviceId)
```

### 🔧 **Fonctionnalités avancées** :

- ✅ **Foreign Key** : `refresh_tokens.userId → users.id`
- ✅ **Trigger automatique** : Mise à jour de `updatedAt`
- ✅ **Fonction PostgreSQL** : `update_updated_at_column()`
- ✅ **Cascade Delete** : Suppression automatique des tokens

## 🚀 Utilisation

### 1. Setup initial complet

```bash
# Démarre PostgreSQL + pgAdmin + initialise la DB
npm run db:setup
```

### 2. Développement quotidien

```bash
# Modifier une entité TypeORM
# src/infrastructure/database/entities/typeorm/user.entity.ts

# Générer la migration automatiquement
npm run migration:generate -- src/infrastructure/database/migrations/AddNewField

# Appliquer la migration
npm run migration:run
```

### 3. Workflow de production

```bash
# Test local
npm run migration:run

# Backup production
pg_dump -h prod-server -U admin cleanarchi > backup.sql

# Migration production
NODE_ENV=production npm run migration:run
```

## 🎯 Architecture Clean respectée

```
Domain Entity (Business) ←→ Mapper ←→ TypeORM Entity (Infrastructure)
     User.ts              ←→  UserMapper  ←→    UserOrmEntity.ts
                                                      ↓
                                              PostgreSQL Table
```

### Séparation des responsabilités :

- **Domain Entity** : Règles métier pures
- **TypeORM Entity** : Mapping base de données
- **Mapper** : Conversion entre les couches
- **Migration** : Évolution contrôlée du schéma

## 🔗 URLs de gestion

- **pgAdmin4** : http://localhost:5050 (admin@cleanarchi.com / admin123)
- **Application** : http://localhost:3000
- **Swagger** : http://localhost:3000/api/docs

## 🎉 Résultat

Votre application dispose maintenant d'un **système de migrations TypeScript professionnel** :

- ✅ **Base de données versionnée** avec migrations TypeScript
- ✅ **Schéma complet** avec toutes les tables et index
- ✅ **Scripts automatisés** pour setup et gestion
- ✅ **Production-ready** avec stratégie de rollback
- ✅ **Clean Architecture** respectée avec séparation des couches

🚀 **Prêt pour le développement et la production !**
