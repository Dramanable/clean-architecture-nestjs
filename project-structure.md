# 📁 Structure Clean Architecture - NestJS (TDD + Logger + i18n)

```
src/
├── 🏛️ domain/                    # COUCHE DOMAIN (Entités + Règles métier)
│   ├── entities/                # Entités métier pures
│   │   ├── user.entity.ts
│   │   └── user.entity.spec.ts  # 🧪 Tests unitaires TDD
│   ├── repositories/            # Contrats des repositories (interfaces)
│   │   └── user.repository.ts
│   ├── value-objects/           # Objects de valeur
│   │   ├── email.vo.ts
│   │   ├── email.vo.spec.ts     # 🧪 Tests TDD pour VO
│   │   ├── money.vo.ts
│   │   └── money.vo.spec.ts
│   ├── services/                # Services métier purs
│   │   ├── user-domain.service.ts
│   │   └── user-domain.service.spec.ts
│   └── exceptions/              # Exceptions métier
│       ├── domain.exception.ts
│       └── domain.exception.spec.ts
│
├── 💼 application/               # COUCHE APPLICATION (Use Cases)
│   ├── use-cases/               # Cas d'usage
│   │   └── users/
│   │       ├── create-user.use-case.ts
│   │       ├── create-user.use-case.spec.ts  # 🧪 Tests TDD
│   │       ├── get-user.use-case.ts
│   │       ├── get-user.use-case.spec.ts
│   │       ├── update-user.use-case.ts
│   │       └── update-user.use-case.spec.ts
│   ├── dtos/                    # Data Transfer Objects
│   │   └── users/
│   │       ├── create-user.dto.ts
│   │       ├── create-user.dto.spec.ts
│   │       ├── user-response.dto.ts
│   │       └── user-response.dto.spec.ts
│   ├── ports/                   # Interfaces pour l'infrastructure
│   │   ├── logger.port.ts       # 📝 Interface pour le logger
│   │   ├── i18n.port.ts         # 🌍 Interface pour i18n
│   │   └── email.port.ts
│   └── exceptions/              # Exceptions applicatives
│       ├── application.exception.ts
│       └── application.exception.spec.ts
│
├── 🔌 infrastructure/           # COUCHE INFRASTRUCTURE (Implémentations)
│   ├── database/                # Base de données
│   │   ├── repositories/        # Implémentations des repositories
│   │   │   ├── user.repository.impl.ts
│   │   │   └── user.repository.impl.spec.ts  # 🧪 Tests avec mocks
│   │   ├── entities/            # Entités ORM (TypeORM/Prisma)
│   │   │   └── user.orm-entity.ts
│   │   ├── migrations/          # Migrations de DB
│   │   └── seeds/               # Données de test
│   ├── logger/                  # 📝 Implementation du logger
│   │   ├── winston-logger.service.ts
│   │   ├── winston-logger.service.spec.ts
│   │   ├── logger.config.ts
│   │   └── logger.types.ts
│   ├── i18n/                    # 🌍 Implementation i18n
│   │   ├── i18n.service.ts
│   │   ├── i18n.service.spec.ts
│   │   ├── translations/
│   │   │   ├── en/
│   │   │   │   ├── common.json
│   │   │   │   └── users.json
│   │   │   └── fr/
│   │   │       ├── common.json
│   │   │       └── users.json
│   │   └── i18n.config.ts
│   ├── external-services/       # Services externes
│   │   ├── email/
│   │   │   ├── email.service.ts
│   │   │   └── email.service.spec.ts
│   │   └── storage/
│   ├── config/                  # Configuration
│   │   ├── database.config.ts
│   │   ├── app.config.ts
│   │   └── validation.config.ts
│   └── common/                  # Utilitaires infrastructure
│       ├── filters/             # Exception filters
│       │   ├── global-exception.filter.ts
│       │   └── global-exception.filter.spec.ts
│       ├── interceptors/        # Interceptors
│       │   ├── logging.interceptor.ts
│       │   ├── logging.interceptor.spec.ts
│       │   ├── i18n.interceptor.ts
│       │   └── i18n.interceptor.spec.ts
│       ├── guards/              # Guards
│       └── decorators/          # Decorators custom
│
├── 🌐 presentation/             # COUCHE PRESENTATION (Controllers)
│   ├── controllers/             # Contrôleurs REST
│   │   └── users/
│   │       ├── users.controller.ts
│   │       └── users.controller.spec.ts  # 🧪 Tests unitaires
│   ├── middlewares/             # Middlewares
│   │   ├── request-logger.middleware.ts
│   │   └── request-logger.middleware.spec.ts
│   ├── validators/              # Validation des inputs
│   │   ├── user.validator.ts
│   │   └── user.validator.spec.ts
│   └── documentation/           # Documentation API (Swagger)
│
├── 🧪 tests/                    # Tests & Configuration TDD
│   ├── unit/                    # Tests unitaires centralisés
│   │   ├── jest.config.js       # Config Jest pour tests unitaires
│   │   ├── setup.ts             # Setup global des tests
│   │   └── mocks/               # Mocks réutilisables
│   │       ├── logger.mock.ts
│   │       ├── i18n.mock.ts
│   │       └── repository.mock.ts
│   ├── fixtures/                # Données de test
│   │   └── user.fixture.ts
│   └── helpers/                 # Helpers de test
│       ├── test-builder.ts      # Builder pattern pour tests
│       └── custom-matchers.ts   # Matchers Jest personnalisés
│
├── 📦 shared/                   # Code partagé
│   ├── constants/
│   ├── enums/
│   ├── types/
│   └── utils/
│
└── main.ts                      # Point d'entrée

# 🐳 Configuration Production
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
│
├── deployment/                  # Déploiement
│   ├── k8s/                     # Kubernetes
│   └── terraform/               # Infrastructure as Code
│
├── scripts/                     # Scripts utilitaires
│   ├── build.sh
│   ├── test.sh
│   └── deploy.sh
│
└── docs/                        # Documentation
    ├── architecture.md
    ├── api.md
    └── deployment.md
```

## 🔗 Flux de Dépendances

```
Presentation → Application → Domain
     ↓              ↓
Infrastructure ← ← ← ←
```

**RÈGLE STRICTE** : Infrastructure dépend de tout, mais rien ne dépend d'Infrastructure !
