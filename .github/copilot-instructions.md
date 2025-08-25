# 🤖 GitHub Copilot Instructions pour Clean Architecture + NestJS

## 🎯 **Context du Projet**

Vous travaillez sur une **application enterprise NestJS** implémentant la **Clean Architecture** avec une approche **TDD rigoureuse**. L'application est **production-ready** avec sécurité, i18n, et patterns enterprise.

**🚀 NOUVEAUTÉ ### 📊 **Métriques de Qualité\*\*

### 🎯 **Objectifs Maintenus**

- ✅ **24 tests** authentification passants (6 LoginUseCase + 5 RefreshTokenUseCase + 6 LogoutUseCase + 7 JwtTokenService)
- ✅ **Clean Architecture** respectée dans tous les composants auth
- ✅ **SOLID principles** appliqués rigoureusement
- ✅ **Security first** approach avec cookies HttpOnly
- ✅ **Enterprise patterns** utilisés (logging, audit, i18n)

### 📈 **Indicateurs de Succès**

- Tests continuent de passer après modifications
- Aucune dépendance circulaire introduite
- Logging et audit trail présents sur toutes les opérations
- Configuration externalisée (JWT secrets, expiration)
- Messages i18n utilisés dans tous les Use Cases
- Permissions vérifiées et exceptions spécifiquestification complet implémenté avec TDD !\*\*

## 🏗️ **Architecture Établie**

### 📁 **Structure des Couches**

```
src/
├── domain/           # 🏢 Règles métier pures (entities, value objects)
├── application/      # 💼 Use cases + ports + exceptions applicatives
├── infrastructure/   # 🔧 Implémentations techniques (repos, services)
├── presentation/     # 🎨 Controllers HTTP + DTOs
└── shared/           # 🔗 Cross-cutting concerns
```

### 🎯 **Principes à Respecter**

- ✅ **Dependency Inversion** : Couches supérieures ne dépendent jamais des inférieures
- ✅ **Single Responsibility** : Chaque classe a une seule responsabilité
- ✅ **TDD First** : Tests avant implémentation (**24 tests auth + autres**)
- ✅ **Clean Code** : Nommage expressif, fonctions courtes, commentaires utiles
- ✅ **Enterprise Security** : Authentification, autorizations, audit trail

## 🔐 **Système d'Authentification Implémenté**

### ✅ **Use Cases Complets (TDD)**

- **LoginUseCase** : Authentification avec JWT + refresh token
- **RefreshTokenUseCase** : Rotation sécurisée des tokens
- **LogoutUseCase** : Déconnexion gracieuse (single/all devices)

### ✅ **Infrastructure Services**

- **JwtTokenService** : Génération/vérification JWT sécurisée
- **BcryptPasswordService** : Hachage mots de passe (12 rounds)
- **TypeOrmRefreshTokenRepository** : Persistence tokens avec métadonnées

### ✅ **Exceptions Applicatives**

- **InvalidCredentialsError** : Identifiants incorrects
- **InvalidRefreshTokenError** : Token refresh invalide
- **TokenExpiredError** : Token expiré
- **UserNotFoundError** : Utilisateur inexistant
- **TokenRepositoryError** : Erreur technique repository

### ✅ **Sécurité Enterprise**

- Cookies **HttpOnly** (anti-XSS)
- **Rotation automatique** des refresh tokens
- **Audit logging** complet avec contexte
- **Device tracking** (IP, User-Agent)
- **Graceful error handling** (logout réussit toujours)

## 🧪 **Approche TDD Établie**

### 🔄 **Cycle RED-GREEN-REFACTOR**

1. **RED** : Écrire un test qui échoue
2. **GREEN** : Implémenter le minimum pour faire passer le test
3. **REFACTOR** : Améliorer le code sans casser les tests

### 🎯 **Standards de Tests (UNIQUEMENT UNITAIRES)**

```typescript
// ✅ Structure de test standardisée
describe('FeatureName', () => {
  describe('Success Cases', () => {
    it('should [action] when [condition]', () => {
      // Arrange
      // Act
      // Assert
    });
  });

  describe('Business Rules Validation', () => {
    it('should reject when [invalid condition]', () => {
      // Test des règles métier
    });
  });
});
```

## 🏢 **Patterns Implémentés**

### 🔧 **Repository Pattern**

```typescript
// Port (Application Layer)
export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
}

// Implémentation (Infrastructure Layer)
export class TypeOrmUserRepository implements IUserRepository {
  // Implémentation technique
}
```

### 🎯 **Use Case Pattern**

```typescript
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // 1. Validation
    // 2. Business Logic
    // 3. Persistence
    // 4. Logging/Audit
  }
}
```

### 🔗 **AppContext Pattern**

```typescript
const context = AppContextFactory.create()
  .operation('CreateUser')
  .requestingUser('admin-123', 'ADMIN')
  .clientInfo('192.168.1.1', 'Mobile App')
  .build();
```

## 🌍 **Système I18n HYBRIDE**

### 📋 **Séparation des Messages**

- **Messages DOMAINE** → `shared/i18n/` (règles métier)
- **Messages OPÉRATIONNELS** → `infrastructure/i18n/` (technique)

### 🎯 **Catégories Établies**

```typescript
// Domaine (business rules)
'errors.user.not_found';
'errors.auth.insufficient_permissions';

// Opérationnel (technical)
'operations.user.creation_attempt';
'success.user.created';
'audit.user.created';
```

## 🔐 **Sécurité Enterprise**

### 🛡️ **Authentification**

- ✅ JWT avec secrets séparés (ACCESS ≠ REFRESH)
- ✅ RefreshToken hachés en base avec bcrypt
- ✅ Device tracking et révocation automatique
- ✅ Protection contre timing attacks

### 📊 **RBAC (Role-Based Access Control)**

```typescript
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Tous droits
  MANAGER = 'MANAGER', // Gestion équipe
  USER = 'USER', // Droits de base
}
```

### 📋 **Audit Trail**

- ✅ AppContext avec correlationId unique
- ✅ Logging structuré avec métadonnées
- ✅ Traçage complet des opérations sensibles

## ⚙️ **Configuration Enterprise**

### 🔧 **Variables d'Environnement**

```bash
# Tokens (durées configurables)
ACCESS_TOKEN_EXPIRATION=900          # 15min prod
REFRESH_TOKEN_EXPIRATION_DAYS=7      # 7 jours prod

# Secrets (obligatoires, min 32 chars, différents)
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret

# Sécurité
BCRYPT_ROUNDS=12                     # Plus élevé en prod
```

## 🎯 **Guidelines pour Suggestions**

### ✅ **DO - Suggestions Préférées**

- Respecter la structure Clean Architecture existante
- Utiliser les patterns établis (Repository, UseCase, AppContext)
- Écrire les tests AVANT l'implémentation (TDD)
- Utiliser le système i18n HYBRIDE pour les messages
- Appliquer les principes SOLID
- Inclure logging avec AppContext
- Gérer les erreurs avec exceptions typées
- Valider les permissions avec RBAC

### ❌ **DON'T - Éviter**

- Créer des dépendances entre couches incorrectes
- Ignorer les tests (108 tests doivent rester verts)
- Mélanger logique métier et technique
- Hardcoder des valeurs (utiliser la configuration)
- Omettre le logging et l'audit trail
- Créer des use cases sans validation des permissions
- Exposer des détails d'implémentation

### 🎯 **Patterns de Code Préférés**

#### **Use Case Structure**

```typescript
export class [Operation]UseCase {
  constructor(
    private readonly repository: I[Entity]Repository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: [Operation]Request): Promise<[Operation]Response> {
    const context = AppContextFactory.create()
      .operation('[Operation]')
      .requestingUser(request.requestingUserId)
      .build();

    this.logger.info(
      this.i18n.t('operations.[entity].[operation]_attempt'),
      context
    );

    try {
      // 1. Validation des permissions
      // 2. Validation des règles métier
      // 3. Logique principale
      // 4. Persistence
      // 5. Logging de succès
      // 6. Audit trail
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.failed'),
        error,
        context
      );
      throw error;
    }
  }
}
```

#### **Entity avec Business Rules**

```typescript
export class [Entity] {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    // ...autres propriétés
  ) {}

  static create(
    email: Email,
    // ...autres paramètres
  ): [Entity] {
    // Validation des règles métier
    if (!email.isValid()) {
      throw new InvalidEmailError();
    }

    return new [Entity](
      generateId(),
      email,
      // ...
    );
  }

  // Méthodes métier
  public canPerform(action: string): boolean {
    // Logique de permissions
  }
}
```

#### **Tests Structure**

```typescript
describe('[FeatureName]', () => {
  let useCase: [Feature]UseCase;
  let mockRepository: jest.Mocked<I[Entity]Repository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      // ... autres méthodes
    } as jest.Mocked<I[Entity]Repository>;

    useCase = new [Feature]UseCase(mockRepository, mockLogger, mockI18n);
  });

  describe('Successful Operations', () => {
    it('should [action] when [valid condition]', async () => {
      // Arrange
      const request = { /* valid data */ };
      mockRepository.findById.mockResolvedValue(validResult);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockRepository.findById).toHaveBeenCalledWith(expectedParams);
    });
  });

  describe('Business Rules Validation', () => {
    it('should reject when [business rule violated]', async () => {
      // Test des règles métier
    });
  });

  describe('Authorization Rules', () => {
    it('should reject when [permission denied]', async () => {
      // Test des autorisations
    });
  });
});
```

## 📊 **Métriques de Qualité**

### 🎯 **Objectifs Maintenus**

- ✅ **108 tests** passants (maintenir 100%)
- ✅ **Clean Architecture** respectée
- ✅ **SOLID principles** appliqués
- ✅ **Security first** approach
- ✅ **Enterprise patterns** utilisés

### 📈 **Indicateurs de Succès**

- Tests continuent de passer après modifications
- Aucune dépendance circulaire introduite
- Logging et audit trail présents
- Configuration externalisée
- Messages i18n utilisés
- Permissions vérifiées

## 🚀 **Contexte Technique**

### 🔧 **Stack Technique**

- **Runtime** : Node.js + TypeScript
- **Framework** : NestJS
- **Testing** : Jest avec TDD strict
- **Architecture** : Clean Architecture 4 layers
- **Security** : JWT + RBAC + Audit
- **I18n** : Système HYBRIDE innovant

### 📋 **Commandes Utiles**

```bash
npm test                    # Tous les tests
npm run test:watch         # Tests en mode watch
npm run test:coverage      # Rapport de couverture
npm run lint               # Linting
npm run build              # Build production
```

---

**🎯 Utilisez ces instructions pour générer du code qui respecte parfaitement l'architecture et les standards établis dans ce projet enterprise !**
