# 🚀 Clean Architecture NestJS - Makefile
# Commandes pour gérer l'environnement de développement Docker

.PHONY: help start start-build start-logs stop restart build test logs shell status health clean reset

# 📋 Aide par défaut
help:
	@echo "🚀 Clean Architecture NestJS - Commandes disponibles:"
	@echo ""
	@echo "🐳 Gestion Docker:"
	@echo "  start        - Démarrer l'environnement de développement"
	@echo "  start-build  - Démarrer avec reconstruction des images"
	@echo "  start-logs   - Démarrer avec affichage des logs"
	@echo "  stop         - Arrêter tous les services"
	@echo "  restart      - Redémarrer les services"
	@echo ""
	@echo "🏗️  Build & Test:"
	@echo "  build        - Construire l'image Docker"
	@echo "  test         - Exécuter les tests dans Docker"
	@echo ""
	@echo "🔍 Monitoring:"
	@echo "  logs         - Afficher les logs de l'application"
	@echo "  shell        - Ouvrir un shell dans le conteneur"
	@echo "  status       - Statut des services"
	@echo "  health       - Vérifier la santé de l'application"
	@echo ""
	@echo "🧹 Maintenance:"
	@echo "  clean        - Nettoyer les ressources Docker"
	@echo "  reset        - Reset complet de l'environnement"
	@echo ""

# ========================================
# � Commandes Docker Compose
# ========================================

# Démarrer l'environnement de développement
start:
	@echo "🚀 Démarrage de l'environnement de développement..."
	docker compose up -d

# Démarrer avec reconstruction des images
start-build:
	@echo "🔨 Reconstruction et démarrage..."
	docker compose up -d --build

# Démarrer avec affichage des logs
start-logs:
	@echo "📋 Démarrage avec logs..."
	docker compose up

# Arrêter tous les services
stop:
	@echo "⏹️  Arrêt des services..."
	docker compose down

# Redémarrer les services
restart:
	@echo "🔄 Redémarrage des services..."
	docker compose restart

# ========================================
# 🏗️ Construction & Tests
# ========================================

# Construire l'image Docker
build:
	@echo "🏗️  Construction de l'image..."
	docker compose build

# Exécuter les tests
test:
	@echo "🧪 Exécution des tests..."
	docker compose exec app npm test

# ========================================
# 🔍 Monitoring & Debug
# ========================================

# Afficher les logs de l'application
logs:
	@echo "📋 Logs de l'application..."
	docker compose logs -f app

# Logs de PostgreSQL
logs-db:
	@echo "📋 Logs de PostgreSQL..."
	docker compose logs -f postgres

# Logs de MongoDB
logs-mongo:
	@echo "📋 Logs de MongoDB..."
	docker compose logs -f mongodb

# Logs de pgAdmin
logs-pgadmin:
	@echo "📋 Logs de pgAdmin..."
	docker compose logs -f pgadmin

# Ouvrir un shell dans le conteneur
shell:
	@echo "🐚 Ouverture du shell..."
	docker compose exec app sh

# Statut des services
status:
	@echo "📊 Statut des services:"
	docker compose ps

# Vérifier la santé de l'application
health:
	@echo "🏥 Vérification de la santé..."
	@curl -f http://localhost:3000/health 2>/dev/null && echo "✅ Service en bonne santé" || echo "❌ Service non disponible"

# ========================================
# 🧹 Nettoyage & Maintenance
# ========================================

# Nettoyer les ressources Docker inutiles
clean:
	@echo "🧹 Nettoyage des ressources Docker..."
	docker compose down
	docker system prune -f
	docker volume prune -f

# Reset complet de l'environnement
reset:
	@echo "🔄 Reset complet de l'environnement..."
	docker compose down -v
	docker system prune -a -f --volumes
	@echo "✅ Reset terminé. Utilisez 'make start-build' pour redémarrer"

# ========================================
# 🎯 Raccourcis Utiles
# ========================================

# Installation des dépendances
install:
	@echo "📦 Installation des dépendances..."
	docker compose exec app npm install

# Mode développement complet
dev: start
	@echo "💻 Environnement de développement prêt!"
	@echo "🌐 Application: http://localhost:3000"
	@echo "📚 Documentation: http://localhost:3000/api/docs"
	@echo "💊 Health Check: http://localhost:3000/health"

# Affichage des URLs utiles
urls:
	@echo "🔗 URLs disponibles:"
	@echo "  🌐 Application:     http://localhost:3000"
	@echo "  📚 Documentation:   http://localhost:3000/api/docs"
	@echo "  💊 Health Check:    http://localhost:3000/health"
	@echo "  🔗 API Base:        http://localhost:3000/api/v1"
	@echo "  🗄️ PostgreSQL:      localhost:5432"
	@echo "  🍃 MongoDB:         localhost:27017"
	@echo "  🔧 pgAdmin:         http://localhost:5050"
	@echo ""
	@echo "🔑 Identifiants pgAdmin:"
	@echo "  📧 Email:           admin@cleanarchi.dev"
	@echo "  🔐 Mot de passe:    admin123"

 
