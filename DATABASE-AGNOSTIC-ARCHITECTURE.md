# 🏗️ Architecture Database-Agnostic - Guide Complet

## 🎯 **Vue d'Ensemble**

Notre architecture permet de **basculer facilement** entre différents types de bases de données :

- **SQL** : PostgreSQL, MySQL, SQLite (via TypeORM)
- **NoSQL** : MongoDB (via @nestjs/mongoose)

## 📁 **Structure Organisée**

```
src/infrastructure/database/
├── 🔧 config/
│   ├── database-config.service.ts    # Configuration TypeORM agnostique
│   ├── mongo-config.service.ts       # Configuration MongoDB/Mongoose
│   └── *.spec.ts                     # Tests TDD
├── 📊 entities/
│   ├── sql/                          # Entités TypeORM (PostgreSQL, MySQL, SQLite)
│   │   ├── user.entity.ts
│   │   └── refresh-token.entity.ts
│   └── mongo/                        # Schémas Mongoose (MongoDB)
│       ├── user.schema.ts
│       └── refresh-token.schema.ts
├── 🔄 mappers/
│   ├── user.mapper.ts                # Domain ↔ SQL
│   ├── mongo-user.mapper.ts          # Domain ↔ MongoDB
│   └── refresh-token.mapper.ts
├── 🏭 factories/
│   └── database-repository.factory.ts # Factory Pattern pour repositories
├── 📝 migrations/
│   ├── postgresql/
│   ├── mysql/
│   └── sqlite/
└── database.module.ts                # Module dynamique multi-DB
```

## ⚙️ **Configuration Par Variable d'Environnement**

### **Basculer entre SQL et MongoDB :**

```bash
# Pour PostgreSQL
DATABASE_TYPE=postgresql
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=admin
DATABASE_PASSWORD=password123
DATABASE_NAME=cleanarchi

# Pour MongoDB
DATABASE_TYPE=mongodb
DATABASE_HOST=localhost
DATABASE_PORT=27017
DATABASE_USERNAME=admin
DATABASE_PASSWORD=password123
DATABASE_NAME=cleanarchi
```

## 🏭 **Pattern Factory pour Repositories**

### **Architecture Modulaire :**

```typescript
// Abstract Factory
interface DatabaseRepositoryFactory {
  createUserRepository(): UserRepository;
  createRefreshTokenRepository(): RefreshTokenRepository;
}

// SQL Factory (TypeORM)
class SqlRepositoryFactory implements DatabaseRepositoryFactory {
  createUserRepository() {
    return new TypeOrmUserRepository();
  }
}

// MongoDB Factory (Mongoose)
class MongoRepositoryFactory implements DatabaseRepositoryFactory {
  createUserRepository() {
    return new MongoUserRepository();
  }
}
```

## 🔄 **Mappers Database-Agnostic**

### **Conversion Domain ↔ Infrastructure :**

#### **SQL Mapper (TypeORM)**

```typescript
export class UserMapper {
  static toDomain(ormEntity: UserOrmEntity): User {
    return new User(new Email(ormEntity.email), ormEntity.name, ormEntity.role);
  }

  static toOrm(domainEntity: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.email = domainEntity.email.value;
    ormEntity.name = domainEntity.name;
    return ormEntity;
  }
}
```

#### **MongoDB Mapper (Mongoose)**

```typescript
export class MongoUserMapper {
  static toDomain(mongoDoc: UserDocument): User {
    return new User(new Email(mongoDoc.email), mongoDoc.name, mongoDoc.role);
  }

  static toMongo(domainEntity: User): Partial<UserDocument> {
    return {
      _id: domainEntity.id,
      email: domainEntity.email.value,
      name: domainEntity.name,
    };
  }
}
```

## 🔧 **Module Dynamique**

### **Auto-configuration selon DATABASE_TYPE :**

```typescript
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    const databaseType = new AppConfigService().getDatabaseType();

    switch (databaseType) {
      case 'postgresql':
      case 'mysql':
      case 'sqlite':
        return this.createSqlModule();

      case 'mongodb':
        return this.createMongoModule();
    }
  }
}
```

## 📊 **Entités Optimisées**

### **SQL (TypeORM)**

```typescript
@Entity('users')
@Index(['email'], { unique: true })
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar', { length: 255, unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @VersionColumn() // Optimistic locking
  version: number;
}
```

### **MongoDB (Mongoose)**

```typescript
@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: String, enum: Object.values(UserRole) })
  role: UserRole;

  // TTL pour auto-suppression
  @Prop({ type: Date, expires: '30d' })
  expiresAt?: Date;
}
```

## 🔄 **Migrations Support**

### **SQL Migrations (TypeORM)**

```typescript
export class CreateUserTable1692700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          /* ... */
        ],
      }),
    );
  }
}
```

### **MongoDB (Schema Evolution)**

```typescript
// Pas de migrations traditionnelles
// Evolution naturelle du schéma avec Mongoose
UserSchema.pre('save', function (next) {
  // Migration on-the-fly des documents
  if (!this.version) {
    this.version = 1;
  }
  next();
});
```

## 🧪 **Tests Multi-Database**

### **Tests avec Both SQL et MongoDB :**

```typescript
describe('UserRepository', () => {
  describe('SQL Implementation (TypeORM)', () => {
    beforeEach(async () => {
      // Setup SQLite en mémoire pour tests
      const module = await Test.createTestingModule({
        imports: [DatabaseModule.forTesting('sql')],
      }).compile();
    });
  });

  describe('MongoDB Implementation (Mongoose)', () => {
    beforeEach(async () => {
      // Setup MongoDB de test
      const module = await Test.createTestingModule({
        imports: [DatabaseModule.forTesting('mongo')],
      }).compile();
    });
  });
});
```

## 🚀 **Avantages de cette Architecture**

### ✅ **Flexibilité**

- **Basculement facile** entre SQL et NoSQL
- **Tests** sur différentes bases simultanément
- **Migration progressive** d'une DB à l'autre

### ✅ **Performance**

- **Optimisations spécifiques** à chaque DB
- **Index appropriés** pour chaque type
- **Pools de connexions** optimisés

### ✅ **Maintenance**

- **Clean Architecture préservée**
- **Domain Layer inchangé**
- **Use Cases agnostiques** de la DB

### ✅ **Évolutivité**

- **Ajout facile** de nouveaux types de DB
- **Support multi-tenant** intégré
- **Monitoring** et métriques uniformes

## 🎯 **Prochaines Étapes Recommandées**

1. **Implémenter** les repositories concrets (SQL + MongoDB)
2. **Créer** les migrations complètes
3. **Tester** le basculement en conditions réelles
4. **Documenter** les patterns de migration de données
5. **Optimiser** les performances selon la DB choisie

---

**Cette architecture vous donne une flexibilité maximale tout en respectant les principes de la Clean Architecture !** 🏆
