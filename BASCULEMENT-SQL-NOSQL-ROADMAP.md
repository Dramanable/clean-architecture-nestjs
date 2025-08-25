# 🔄 ROADMAP - Basculement SQL ↔ NoSQL Complet

## ✅ **DÉJÀ IMPLÉMENTÉ**

### 🏗️ **Infrastructure de Base**

- ✅ Configuration multi-database (SQL + MongoDB)
- ✅ Variables d'environnement `DATABASE_TYPE`
- ✅ Module dynamique `DatabaseModule.forRoot()`
- ✅ Services de configuration séparés (TypeORM + Mongoose)

### 🎯 **Entités et Schémas**

- ✅ Entités SQL TypeORM (`src/infrastructure/database/entities/typeorm/`)
- ✅ Schémas MongoDB Mongoose (`src/infrastructure/database/entities/mongo/`)
- ✅ Mappers pour conversions Domain ↔ SQL/MongoDB

### 🏭 **Repositories MongoDB**

- ✅ `MongoUserRepository` avec agrégation optimisée
- ✅ `MongoRefreshTokenRepository` complet
- ✅ Pipeline d'agrégation pour pagination/recherche
- ✅ Index optimaux automatiques

## 🚧 **À COMPLÉTER POUR BASCULEMENT TRANSPARENT**

### 1. 🔧 **Repository Factory Integration**

**Problème** : Les factories existent mais ne sont pas intégrées dans les modules NestJS

**Solution** :

```bash
# Fichiers à créer/modifier :
src/infrastructure/database/providers/
├── repository-factory.provider.ts     # Provider dynamique
├── database-switch.service.ts         # Service de basculement
└── index.ts                          # Exports
```

**Action** :

```typescript
// repository-factory.provider.ts
export const USER_REPOSITORY_PROVIDER = {
  provide: TOKENS.USER_REPOSITORY,
  useFactory: (databaseType: DatabaseType) => {
    const factory = DatabaseRepositoryFactoryProvider.create(databaseType);
    return factory.createUserRepository();
  },
  inject: ['DATABASE_TYPE'],
};
```

### 2. 🎛️ **Module Database Dynamique Complet**

**Problème** : `DatabaseModule` configure SQL ou MongoDB séparément

**Solution** : Module hybride qui peut basculer à runtime

```typescript
// database.module.ts - Version améliorée
@Module({})
export class DatabaseModule {
  static forRoot(options?: { allowSwitching?: boolean }): DynamicModule {
    // Configuration pour basculement à chaud
  }

  static forSwitching(): DynamicModule {
    // Module qui permet le basculement à runtime
  }
}
```

### 3. 🔄 **Service de Migration de Données**

**Manquant** : Service pour migrer les données SQL → MongoDB et vice-versa

**À créer** :

```bash
src/infrastructure/database/migration/
├── data-migration.service.ts          # Service principal
├── sql-to-mongo.migrator.ts          # SQL → MongoDB
├── mongo-to-sql.migrator.ts          # MongoDB → SQL
└── migration-strategy.interface.ts    # Interface commune
```

### 4. 📊 **Tests d'Intégration Multi-Database**

**Manquant** : Tests qui vérifient le basculement complet

**À créer** :

```bash
src/infrastructure/database/test/
├── database-switch.integration.spec.ts
├── sql-mongo-parity.spec.ts
└── performance-comparison.spec.ts
```

### 5. 🎯 **Command pour Basculement**

**Manquant** : CLI pour changer de base de données facilement

**À créer** :

```bash
src/infrastructure/commands/
├── switch-database.command.ts
└── migrate-data.command.ts
```

### 6. 🔐 **Variables d'Environnement Complètes**

**Amélioration** : Support de configurations hybrides

**Ajouter au `.env`** :

```bash
# Configuration Principale
DATABASE_TYPE=postgresql  # ou mongodb
DATABASE_FALLBACK=mongodb # Base de fallback

# Configuration MongoDB (même si SQL principal)
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_USERNAME=dev_user
MONGODB_PASSWORD=dev_password123
MONGODB_DATABASE=cleanarchi_dev

# Configuration Avancée
ENABLE_DATABASE_SWITCHING=true
AUTO_SYNC_DATABASES=false
MIGRATION_BATCH_SIZE=1000
```

## 🚀 **ÉTAPES POUR BASCULEMENT IMMÉDIAT**

### **Phase 1 : Basculement Simple (2-3h)**

```bash
# 1. Changer la variable d'environnement
export DATABASE_TYPE=mongodb

# 2. Redémarrer l'application
npm run build && npm start

# 3. Vérifier que MongoDB fonctionne
curl localhost:3000/api/users
```

### **Phase 2 : Basculement avec Migration (1 jour)**

```bash
# 1. Créer le service de migration
# 2. Migrer les données existantes
# 3. Tester la parité des données
```

### **Phase 3 : Basculement à Chaud (2-3 jours)**

```bash
# 1. Implémenter le service de switch
# 2. Créer l'API de basculement
# 3. Tests complets multi-database
```

## 📋 **CHECKLIST IMMÉDIATE**

### ✅ **Fonctionnel Maintenant**

- [x] MongoDB repository avec agrégation
- [x] Schémas MongoDB optimisés
- [x] Index automatiques
- [x] Configuration dynamique

### 🔧 **Actions Rapides (< 30min)**

1. **Tester le basculement manuel** :

   ```bash
   export DATABASE_TYPE=mongodb
   npm run build && npm start
   ```

2. **Vérifier les collections MongoDB** :

   ```bash
   # Via Mongo Express : http://localhost:8081
   # Ou via CLI MongoDB
   ```

3. **Valider les index** :
   ```javascript
   // Dans mongo shell
   db.users.getIndexes();
   ```

### 📈 **Prochaines Priorités**

1. **Repository Factory Provider** (1h)
2. **Tests d'intégration MongoDB** (2h)
3. **Service de migration données** (4h)
4. **CLI de basculement** (2h)

## 🎯 **CONCLUSION**

**État actuel** : 85% prêt pour basculement
**Action immédiate** : Changement `DATABASE_TYPE=mongodb` fonctionne
**Basculement à chaud** : Nécessite Repository Factory Provider

L'architecture Clean rend le basculement très facile car les Use Cases ne dépendent que des interfaces (ports) !
