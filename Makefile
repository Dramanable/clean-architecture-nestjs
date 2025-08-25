# 🚀 Script de Démarrage Docker pour Clean Architecture NestJS

# ========================================
# 🐳 Commandes Docker Compose
# ========================================

# Démarrer tous les services en mode développement
start:
	docker-compose -f docker-compose.dev.yml up -d

# Démarrer avec rebuild en mode développement
start-build:
	docker-compose -f docker-compose.dev.yml up -d --build

# Démarrer seulement les bases de données
start-db:
	docker-compose -f docker-compose.dev.yml up -d postgres mongodb redis

# Démarrer avec les logs
start-logs:
	docker-compose -f docker-compose.dev.yml up

# ========================================
# 🔧 Gestion des Services
# ========================================

# Arrêter tous les services
stop:
	docker-compose -f docker-compose.dev.yml down

# Arrêter et supprimer les volumes
stop-clean:
	docker-compose -f docker-compose.dev.yml down -v

# Redémarrer les services
restart:
	docker-compose -f docker-compose.dev.yml restart

# ========================================
# 🏗️ Construction & Tests
# ========================================

# Construire l'image de l'application
build:
	docker build -t clean-architecture-nestjs:latest .

# Construire pour la production
build-prod:
	docker build --target production -t clean-architecture-nestjs:prod .

# Construire pour le développement
build-dev:
	docker build --target development -t clean-architecture-nestjs:dev .

# Tester l'application dans Docker
test:
	docker run --rm clean-architecture-nestjs:latest npm test

# ========================================
# 🗄️ Gestion des Données
# ========================================

# Exécuter les migrations SQL
migrate-sql:
	docker-compose -f docker-compose.dev.yml exec app npm run migration:run

# Exécuter les migrations NoSQL
migrate-nosql:
	docker-compose -f docker-compose.dev.yml exec app npm run migration:mongo:up

# Rollback des migrations SQL
rollback-sql:
	docker-compose -f docker-compose.dev.yml exec app npm run migration:revert

# Rollback des migrations NoSQL
rollback-nosql:
	docker-compose -f docker-compose.dev.yml exec app npm run migration:mongo:down

# ========================================
# 🔍 Monitoring & Debug
# ========================================

# Voir les logs de l'application
logs:
	docker-compose -f docker-compose.dev.yml logs -f app

# Voir les logs de PostgreSQL
logs-postgres:
	docker-compose -f docker-compose.dev.yml logs -f postgres

# Voir les logs de MongoDB
logs-mongo:
	docker-compose -f docker-compose.dev.yml logs -f mongodb

# Entrer dans le conteneur de l'application
shell:
	docker-compose -f docker-compose.dev.yml exec app sh

# ========================================
# 🧹 Nettoyage
# ========================================

# Nettoyer les images non utilisées
clean-images:
	docker image prune -f

# Nettoyer tout (images, conteneurs, volumes)
clean-all:
	docker system prune -a -f --volumes

# Supprimer les volumes de données de développement
clean-volumes:
	docker volume rm testingcleanarchi_postgres_dev_data testingcleanarchi_mongodb_dev_data testingcleanarchi_redis_dev_data testingcleanarchi_pgadmin_dev_data 2>/dev/null || true

# ========================================
# 📊 Surveillance & Health Checks
# ========================================

# Vérifier le statut des services
status:
	docker-compose -f docker-compose.dev.yml ps

# Vérifier la santé de l'application
health:
	curl -f http://localhost:3000/health || echo "Service not healthy"

# Vérifier les performances
stats:
	docker stats

# ========================================
# 🔐 Sécurité & Maintenance
# ========================================

# Scanner les vulnérabilités de l'image
security-scan:
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		aquasec/trivy clean-architecture-nestjs:latest

# Analyser la taille de l'image
image-analysis:
	docker images clean-architecture-nestjs

# ========================================
# 🎯 Raccourcis Pratiques
# ========================================

# Développement rapide (DB + logs)
dev:
	make start-db && sleep 5 && npm run start:dev

# Production locale complète
prod:
	make build-prod && docker-compose -f docker-compose.prod.yml up -d

# Reset complet pour nouveau démarrage
reset:
	make stop-clean && make clean-volumes && make start-build

.PHONY: start start-build start-db start-logs stop stop-clean restart \
        build build-prod build-dev test \
        migrate-sql migrate-nosql rollback-sql rollback-nosql \
        logs logs-postgres logs-mongo shell \
        clean-images clean-all clean-volumes \
        status health stats security-scan image-analysis \
        dev prod reset
