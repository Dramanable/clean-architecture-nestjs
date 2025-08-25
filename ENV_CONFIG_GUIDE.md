# 🔧 Guide de Configuration Environnementale

## 📁 Structure des fichiers de configuration

Le projet utilise un système de configuration multi-environnement avec `@nestjs/config` :

```
├── .env                 # 🔧 Configuration par défaut/fallback
├── .env.development     # 🚀 Configuration développement  
├── .env.production      # 🔒 Configuration production
└── .env.example         # 📋 Template avec toutes les variables
```

## 🎯 Fonctionnement automatique

La configuration se charge automatiquement selon `NODE_ENV` :

```typescript
// app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
  expandVariables: true,
}),
```

### 📝 Ordre de priorité

1. **`.env.development`** (quand `NODE_ENV=development`)
2. **`.env.production`** (quand `NODE_ENV=production`) 
3. **`.env`** (fichier de fallback)
4. **Variables d'environnement système** (priorité absolue)

## 🚀 Utilisation en développement

```bash
# Automatiquement en mode development
npm run start:dev

# Explicitement 
NODE_ENV=development npm run start:dev
```

Variables chargées depuis `.env.development` :
- `DATABASE_NAME=cleanarchi_dev`
- `DATABASE_USERNAME=dev_user`
- `LOG_LEVEL=debug`

## 🔒 Utilisation en production

```bash
NODE_ENV=production npm run start:prod
```

Variables chargées depuis `.env.production` avec substitution :
- `DATABASE_HOST=${DB_HOST}` → utilise la variable d'environnement système
- `ACCESS_TOKEN_SECRET=${ACCESS_TOKEN_SECRET}` → sécurisé via env système

## 🔧 Configuration AppConfigService

Le service utilise `ConfigService` de NestJS avec valeurs par défaut :

```typescript
getDatabaseHost(): string {
  return this.configService.get<string>('DATABASE_HOST', 'localhost');
}

getDatabasePassword(): string {
  const password = this.configService.get<string>('DATABASE_PASSWORD');
  if (!password) {
    throw new Error('DATABASE_PASSWORD is required');
  }
  return password;
}
```

## 🌍 Variables par environnement

### Development
- Base de données : `cleanarchi_dev`
- Logs : `debug`
- Sécurité : relâchée pour faciliter le dev
- Pool de connexions : 10

### Production  
- Base de données : via variables système
- Logs : `warn` (moins verbeux)
- Sécurité : stricte (bcrypt rounds élevés)
- Pool de connexions : 20

## 🔍 Debug de configuration

Pour vérifier quelle configuration est chargée :

```typescript
// Dans un service
constructor(private configService: ConfigService) {
  console.log('Database Host:', this.configService.get('DATABASE_HOST'));
  console.log('Environment:', this.configService.get('NODE_ENV'));
}
```

## 📋 Checklist déploiement

- [ ] Créer `.env.production` avec variables système
- [ ] Définir toutes les variables `${VAR}` dans l'environnement  
- [ ] Tester avec `NODE_ENV=production`
- [ ] Vérifier les valeurs sensibles (secrets, mots de passe)
- [ ] Confirmer les pools de connexion et timeouts
