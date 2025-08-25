# 🐳 Docker Infrastructure pour Clean Architecture

## Services Disponibles

### 🐘 PostgreSQL (Port 5432)
- **Base principale** pour les utilisateurs et données relationnelles
- **User:** admin  
- **Password:** password123
- **Database:** cleanarchi

### 🍃 MongoDB (Port 27017)  
- **Logs structurés** et données non-relationnelles
- **User:** admin
- **Password:** password123
- **Database:** cleanarchi

### ⚡ Redis (Port 6379)
- **Sessions utilisateur** et cache
- **Password:** password123
- **Persistence:** AOF activé

## Interfaces d'Administration

### 📊 Adminer (Port 8080)
- Interface web pour PostgreSQL
- **URL:** http://localhost:8080

### 🌿 Mongo Express (Port 8081)
- Interface web pour MongoDB  
- **URL:** http://localhost:8081
- **Login:** admin / admin

### 🔴 Redis Commander (Port 8082)
- Interface web pour Redis
- **URL:** http://localhost:8082

## Commandes Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Nettoyer complètement (⚠️ supprime les données)
docker-compose down -v
```

## Utilisation dans l'Application

### PostgreSQL - Tables Principales
```sql
-- Users table
-- Sessions table  
-- Roles/Permissions tables
```

### MongoDB - Collections
```javascript
// Logs collection
// Analytics collection
// Audit trail collection
```

### Redis - Structures
```
// user:sessions:{userId}
// auth:refresh_tokens:{tokenId}
// cache:user:{userId}
```
