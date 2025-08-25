# 🔄 Guide des Migrations TypeORM

## 📋 Vue d'ensemble

Les **entités TypeORM** dans `/src/infrastructure/database/entities/typeorm/` servent à :

1. **Mapping ORM** : Définir la structure des tables PostgreSQL
2. **Génération de migrations** : TypeORM utilise ces entités pour créer les migrations
3. **Synchronisation automatique** : En développement uniquement (jamais en production)
4. **Validation de schéma** : Assurer la cohérence entre code et base de données

## 🏗️ Structure des Entités

```
src/infrastructure/database/entities/
├── typeorm/                    # 🎯 Entités TypeORM (PostgreSQL)
│   ├── user.entity.ts          # Table users
│   └── refresh-token.entity.ts # Table refresh_tokens
└── sql/                        # 🗂️ Anciennes entités (à supprimer)
```

## 🔧 Commandes de Migration

### Générer une migration automatiquement

```bash
# TypeORM compare les entités avec la DB et génère la migration
npm run migration:generate -- src/infrastructure/database/migrations/AddNewField

# Ou manuellement avec un nom spécifique
npm run migration:generate -- src/infrastructure/database/migrations/$(date +%s)-AddPasswordHistory
```

### Créer une migration vide

```bash
# Pour du SQL personnalisé ou des changements complexes
npm run migration:create -- src/infrastructure/database/migrations/CustomDataUpdate
```

### Exécuter les migrations

```bash
# Appliquer toutes les migrations en attente
npm run migration:run

# Afficher le statut des migrations
npm run migration:show

# Annuler la dernière migration
npm run migration:revert
```

### Commandes utiles de développement

```bash
# Synchroniser le schéma (DEV UNIQUEMENT)
npm run schema:sync

# Supprimer tout le schéma (DANGER!)
npm run schema:drop
```

## 🎯 Workflow Typique

### 1. Modifier une entité

```typescript
// src/infrastructure/database/entities/typeorm/user.entity.ts
@Entity('users')
export class UserOrmEntity {
  // ... champs existants

  @Column({ type: 'varchar', length: 255, nullable: true })
  newField?: string; // 🆕 Nouveau champ
}
```

### 2. Générer la migration

```bash
npm run migration:generate -- src/infrastructure/database/migrations/AddUserNewField
```

### 3. Vérifier la migration générée

```typescript
// Migration générée automatiquement
export class AddUserNewField1692970800001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD "newField" character varying(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "newField"
    `);
  }
}
```

### 4. Appliquer la migration

```bash
npm run migration:run
```

## 🔄 Correspondance Domain ↔ TypeORM

### Entité Domain (Business Logic)

```typescript
// src/domain/entities/user.entity.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly name: string,
    private _passwordChangeRequired: boolean = false,
    // ... autres champs
  ) {}
}
```

### Entité TypeORM (Database Mapping)

```typescript
// src/infrastructure/database/entities/typeorm/user.entity.ts
@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'boolean', default: false })
  passwordChangeRequired: boolean;
  // ... autres champs mappés
}
```

### Mapper (Conversion)

```typescript
// src/infrastructure/database/mappers/typeorm-user.mapper.ts
export class UserMapper {
  static toDomain(ormEntity: UserOrmEntity): User {
    return User.create(
      new Email(ormEntity.email),
      ormEntity.name,
      ormEntity.passwordChangeRequired,
      // ...
    );
  }

  static toOrm(domainEntity: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.email = domainEntity.email.value;
    ormEntity.passwordChangeRequired = domainEntity.passwordChangeRequired;
    // ...
    return ormEntity;
  }
}
```

## 📊 Configuration de Production

### Variables d'environnement

```bash
# Production - JAMAIS synchronize=true
NODE_ENV=production
DATABASE_TYPE=postgresql
DATABASE_HOST=prod-postgres.example.com
DATABASE_PORT=5432
DATABASE_USERNAME=app_user
DATABASE_PASSWORD=secure_password
DATABASE_NAME=cleanarchi_prod
```

### Migration en production

```bash
# 1. Backup de la base
pg_dump -h localhost -U admin cleanarchi > backup.sql

# 2. Test des migrations sur copie
npm run migration:run

# 3. Si OK, appliquer en production
NODE_ENV=production npm run migration:run
```

## 🛡️ Bonnes Pratiques

### ✅ DO

- **Toujours tester** les migrations sur une copie de données
- **Backup** avant migration en production
- **Nommer explicitement** les migrations (AddUserPhone, RemoveOldIndex)
- **Versionner** toutes les migrations
- **Utiliser les transactions** pour migrations complexes

### ❌ DON'T

- **Jamais synchronize=true** en production
- **Jamais modifier** une migration déjà appliquée
- **Jamais supprimer** des colonnes sans stratégie de rollback
- **Éviter** les changements de type incompatibles

## 🔍 Dépannage

### Migration échoue

```bash
# Voir les migrations appliquées
npm run migration:show

# Forcer le rollback de la dernière
npm run migration:revert

# Vérifier l'état de la DB
psql -h localhost -U admin -d cleanarchi -c "\d users"
```

### Conflit d'entités

```bash
# Régénérer depuis zéro (DEV uniquement)
npm run schema:drop
npm run migration:run
```

### Données incohérentes

```sql
-- Vérifier la table de migrations
SELECT * FROM migrations_history ORDER BY timestamp DESC;

-- Vérifier l'intégrité des données
SELECT COUNT(*) FROM users WHERE email IS NULL;
```

## 🎉 Résultat

Avec ce système de migrations :

- ✅ **Évolution contrôlée** du schéma de base de données
- ✅ **Versioning** des changements de structure
- ✅ **Rollback** sécurisé en cas de problème
- ✅ **Cohérence** entre environnements (dev/staging/prod)
- ✅ **Audit trail** complet des modifications
