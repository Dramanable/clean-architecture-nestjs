# 🐳 Guide Docker Développement - Clean Architecture NestJS

## 🚀 Démarrage Rapide

### 1. Premier Lancement

```bash
# Construction de l'image avec résolution des problèmes de permissions
./dev-docker.sh build

# Démarrage des services
./dev-docker.sh start
```

### 2. Utilisation Quotidienne

```bash
# Démarrer le développement
./dev-docker.sh start

# Voir les logs en temps réel
./dev-docker.sh logs -f

# Ouvrir un terminal dans le conteneur
./dev-docker.sh shell

# Arrêter les services
./dev-docker.sh stop
```

## 🛠️ Scripts Disponibles

### Scripts Automatiques

- `./dev-docker.sh` - Script principal avec toutes les commandes
- `./docker-dev-build.sh` - Build uniquement l'image
- `./docker-dev-run.sh` - Lancement simple du conteneur

### Docker Compose

```bash
# Avec docker-compose directement (si besoin)
export USER_ID=$(id -u) GROUP_ID=$(id -g)
docker-compose -f docker-compose.dev.yml up
```

## 🔧 Résolution des Problèmes de Permissions

### ✅ Solutions Implémentées

1. **IDs Utilisateur/Groupe Synchronisés**
   - L'image utilise les mêmes IDs que votre utilisateur système
   - Évite les conflits de permissions sur les fichiers

2. **Script d'Entrée Intelligent**
   - Corrige automatiquement les permissions au démarrage
   - Supprime le dossier `dist` s'il cause des problèmes

3. **Volumes Optimisés**
   - `node_modules` en volume anonyme (pas de conflit)
   - `dist` en volume anonyme (permissions automatiques)
   - Code source monté en temps réel pour hot reload

### 🐛 En Cas de Problème

```bash
# Si erreur de permissions persistantes
./dev-docker.sh clean
./dev-docker.sh build
./dev-docker.sh start

# Debug dans le conteneur
./dev-docker.sh shell
# Puis dans le conteneur:
ls -la /app/
whoami
id
```

## 📁 Structure Docker

```
📦 Configuration Docker
├── 🐳 Dockerfile.dev          # Image de développement
├── 🔧 docker-compose.dev.yml  # Services (app + postgres)
├── 🌍 .env.docker             # Variables d'environnement
├── 🚀 dev-docker.sh           # Script principal
├── 🔨 docker-dev-build.sh     # Build uniquement
└── 🏃 docker-dev-run.sh       # Run simple
```

## 🌐 Ports Exposés

- **3000** - Application NestJS
- **9229** - Debug Node.js
- **5432** - PostgreSQL
- **5050** - pgAdmin (optionnel)
- **5555** - Port supplémentaire

## 🗄️ Base de Données

### Configuration Development

```env
Host: localhost
Port: 5432
Database: cleanarchi_dev
Username: dev_user
Password: dev_password123
```

### pgAdmin (Interface Web)

- URL: http://localhost:5050
- Email: dev@cleanarchi.com
- Password: dev123

## ⚡ Hot Reload

Le hot reload est **automatiquement activé** :

- Modification de fichiers TypeScript → Rechargement auto
- Changement de configuration → Redémarrage auto
- Tests lancés avec `npm test` dans le conteneur

## 🧹 Maintenance

```bash
# Nettoyage complet (volumes, images, cache)
./dev-docker.sh clean

# Reconstruire l'image après modifications majeures
./dev-docker.sh build

# Redémarrage rapide
./dev-docker.sh restart
```

---

### 🎯 Avantages de cette Configuration

✅ **Permissions parfaites** - Aucun conflit avec votre système  
✅ **Hot reload rapide** - Modifications instantanées  
✅ **Isolation complète** - Pas d'installation Node.js locale nécessaire  
✅ **Base de données intégrée** - PostgreSQL prêt à l'emploi  
✅ **Debug facile** - Port 9229 pour le debug VS Code  
✅ **Scripts simplifiés** - Une commande pour tout faire
