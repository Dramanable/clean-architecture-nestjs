# 🧪 Méthodologie Test Driven Development (TDD)

## 🔄 Cycle TDD : Red → Green → Refactor

### **1. RED** 🔴
- Écrire un test qui échoue
- Le test doit être minimal et spécifique
- Compiler et vérifier que le test échoue pour la bonne raison

### **2. GREEN** 🟢  
- Écrire le code MINIMAL pour faire passer le test
- Pas d'optimisation, juste faire fonctionner
- Le test doit passer

### **3. REFACTOR** 🔄
- Améliorer le code sans changer le comportement
- Éliminer la duplication
- Améliorer la lisibilité
- Tous les tests doivent toujours passer

## 📋 Notre Roadmap TDD pour User Entity

### **Phase 1 : Domain Layer (Entité User)**
```
1. Test: User peut être créé avec email valide ❌
2. Code: Constructeur User minimal ✅
3. Refactor: Structure propre 🔄

4. Test: User rejette email invalide ❌
5. Code: Validation email ✅
6. Refactor: Extract Value Object Email 🔄

7. Test: User a un ID unique ❌
8. Code: ID generation ✅
9. Refactor: Clean structure 🔄
```

### **Phase 2 : Application Layer (Use Cases)**
```
1. Test: CreateUserUseCase avec données valides ❌
2. Code: Use case minimal ✅
3. Refactor: Clean dependencies 🔄

4. Test: CreateUserUseCase avec email dupliqué ❌
5. Code: Validation business logic ✅
6. Refactor: Error handling 🔄
```

### **Phase 3 : Infrastructure Layer**
```
1. Test: UserRepository save/find ❌
2. Code: Repository implementation ✅
3. Refactor: Clean interface 🔄
```

### **Phase 4 : Presentation Layer**
```
1. Test: UserController POST endpoint ❌
2. Code: Controller minimal ✅
3. Refactor: Validation & responses 🔄
```

## 🛠️ Outils TDD

- **Jest** : Framework de test
- **ts-jest** : Support TypeScript
- **@types/jest** : Types Jest
- **jest-mock-extended** : Mocks typés

## 📏 Règles TDD Strictes

1. ❌ **JAMAIS** écrire de code production sans test qui échoue
2. ❌ **JAMAIS** écrire plus de test que nécessaire pour échouer
3. ❌ **JAMAIS** écrire plus de code que nécessaire pour passer le test
4. ✅ **TOUJOURS** refactorer quand les tests passent
5. ✅ **TOUJOURS** vérifier que les tests échouent pour la bonne raison
