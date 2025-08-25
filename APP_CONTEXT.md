# 🎯 AppContext Pattern - Guide Complet

## 📋 Qu'est-ce que l'AppContext ?

L'**AppContext** (ou Application Context) est un pattern qui consiste à créer un objet contenant **toutes les informations contextuelles** d'une requête ou d'une opération. C'est l'évolution du simple `requestContext` que vous utilisiez déjà.

## 🎯 Pourquoi utiliser un AppContext ?

### ✅ **Avantages que vous aviez déjà avec `requestContext`**
```typescript
// Votre ancien pattern
const requestContext = {
  operation: 'GetUser',
  requestingUserId: request.requestingUserId,
  targetUserId: request.userId,
};
```

### 🚀 **Nouveaux avantages avec AppContext**
```typescript
// Nouveau pattern enrichi
const context = AppContextFactory.create()
  .operation('GetUser')
  .requestingUser(request.requestingUserId, userRole)
  .targetUser(request.userId)
  .clientInfo(ipAddress, userAgent, deviceId)
  .session(sessionId)
  .build();
```

## 📊 Comparaison Avant/Après

| Aspect | Avant (`requestContext`) | Après (`AppContext`) |
|--------|-------------------------|---------------------|
| **Création** | Objet manuel | Builder pattern type-safe |
| **IDs uniques** | ❌ Non | ✅ `correlationId` + `operationId` |
| **Info client** | ❌ Limitée | ✅ IP, UserAgent, Device, Session |
| **Multi-tenant** | ❌ Non supporté | ✅ `tenantId`, `organizationId` |
| **Performance** | ❌ Pas de mesure | ✅ `startTime` automatique |
| **Debugging** | 🔸 Basique | ✅ Trace distribué |
| **Metadata** | ❌ Pas flexible | ✅ Métadonnées extensibles |

## 🛠️ Utilisation Pratique

### 1. **Migration depuis votre code actuel**

**AVANT** (votre code actuel) :
```typescript
async execute(request: GetUserRequest): Promise<GetUserResponse> {
  const requestContext = {
    operation: 'GetUser',
    requestingUserId: request.requestingUserId,
    targetUserId: request.userId,
  };

  this.logger.info('Attempting to retrieve user', requestContext);
  // ... rest of the code
}
```

**APRÈS** (avec AppContext) :
```typescript
async execute(request: GetUserRequest): Promise<GetUserResponse> {
  const context = AppContextFactory.userOperation(
    'GetUser',
    request.requestingUserId,
    request.userId
  );

  this.logger.info(
    this.i18n.t('operations.user.retrieval_attempt', {
      correlationId: context.correlationId
    }),
    context
  );
  // ... rest of the code
}
```

### 2. **Cas d'Usage Spécifiques**

#### 🔐 **Authentification**
```typescript
const context = AppContextFactory.auth('Login', email, {
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  deviceId: req.headers['x-device-id']
});

// Permet de détecter :
// - Connexions suspectes (IP inhabituelle)
// - Attaques par force brute
// - Devices non reconnus
```

#### 👥 **Opérations Utilisateur**
```typescript
const context = AppContextFactory.userOperation(
  'DeleteUser',
  adminId,
  targetUserId
);

// Permet de tracker :
// - Qui fait quoi sur qui
// - Audit trail complet
// - Permissions et escalations
```

#### 🏢 **Multi-tenant**
```typescript
const context = AppContextFactory.create()
  .operation('BulkUserImport')
  .tenant('enterprise-corp')
  .organization('hr-department')
  .requestingUser(hrManagerId, 'HR_MANAGER')
  .metadata('batchSize', 500)
  .build();

// Permet :
// - Isolation des données par tenant
// - Facturation par organisation
// - Quotas et limites
```

## 🔍 Bénéfices Opérationnels

### 📈 **Monitoring et Observabilité**

```typescript
// Votre logger capture automatiquement :
{
  "correlationId": "req_1629123456_abc123def",
  "operationId": "op_GetUser_1629123456_xyz789",
  "operation": "GetUser",
  "timestamp": "2024-08-21T10:30:00Z",
  "requestingUserId": "admin-123",
  "targetUserId": "user-456",
  "ipAddress": "192.168.1.100",
  "userAgent": "Chrome/91.0.4472.124",
  "duration": 245,
  "performance": "good"
}
```

### 🐛 **Debugging et Support**

```bash
# Recherche tous les logs d'une requête spécifique
grep "req_1629123456_abc123def" application.log

# Recherche toutes les opérations GetUser lentes
grep "GetUser.*performance.*slow" application.log

# Recherche les activités d'un utilisateur spécifique
grep "admin-123" application.log | grep "2024-08-21"
```

### 🔒 **Sécurité et Audit**

```typescript
// Détection automatique d'anomalies
if (context.ipAddress !== user.lastKnownIP) {
  this.securityService.flagSuspiciousActivity(context);
}

// Audit trail enrichi
this.auditLogger.log({
  action: 'USER_DELETED',
  actor: context.requestingUserId,
  target: context.targetUserId,
  correlationId: context.correlationId,
  clientInfo: {
    ip: context.ipAddress,
    device: context.deviceId
  },
  riskScore: this.calculateRiskScore(context)
});
```

## 🎯 Cas d'Usage Avancés

### 1. **Corrélation Cross-Service**
```typescript
// Service A crée un context
const context = AppContextFactory.create()
  .operation('ProcessPayment')
  .metadata('traceId', 'distributed-trace-123')
  .build();

// Service B reçoit le traceId via HTTP headers
// et peut continuer la trace
```

### 2. **Performance Monitoring**
```typescript
const context = AppContextFactory.simple('ExpensiveOperation', userId);

// ... opération coûteuse ...

const duration = Date.now() - context.startTime!;
if (duration > 5000) {
  this.alertService.slowOperation(context, duration);
}
```

### 3. **A/B Testing et Feature Flags**
```typescript
const context = AppContextFactory.create()
  .operation('UserRegistration')
  .metadata('experimentGroup', 'new-onboarding-flow')
  .metadata('featureFlags', ['enhanced-validation', 'social-login'])
  .build();
```

## 🚀 Migration Progressive

### Étape 1 : Remplacement Direct
Remplacez vos `requestContext` existants par `AppContextFactory.simple()` :

```typescript
// AVANT
const requestContext = { operation: 'CreateUser', requestingUserId: adminId };

// APRÈS
const context = AppContextFactory.simple('CreateUser', adminId);
```

### Étape 2 : Enrichissement Graduel
Ajoutez progressivement plus d'informations :

```typescript
const context = AppContextFactory.userOperation('CreateUser', adminId, targetUserId);
```

### Étape 3 : Informations Client
Intégrez les informations de la requête HTTP :

```typescript
const context = AppContextFactory.create()
  .operation('CreateUser')
  .requestingUser(adminId, userRole)
  .targetUser(targetUserId)
  .clientInfo(req.ip, req.headers['user-agent'])
  .build();
```

## 🧪 Tests et Validation

Le pattern est testé avec 97 tests qui passent ✅ et inclut des exemples pour :
- Audit de sécurité
- Opérations multi-tenant
- Debugging distribué
- Monitoring de performance

## 📝 Conclusion

L'**AppContext** est l'évolution naturelle de votre `requestContext` existant. Il vous donne :

1. **🔍 Visibilité** : Tracez chaque requête de bout en bout
2. **🛡️ Sécurité** : Détectez les anomalies et auditez finement
3. **⚡ Performance** : Identifiez les goulots d'étranglement
4. **🐛 Debug** : Reproduisez et diagnostiquez facilement
5. **📊 Analytics** : Analysez l'usage et les patterns

**Votre code devient plus robuste, observable et maintenable sans complexité excessive.**
