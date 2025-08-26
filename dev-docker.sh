#!/bin/bash

# 🚀 Script de Développement Docker - Clean Architecture NestJS
# Usage: ./dev-docker.sh [build|start|stop|logs|shell]

set -e

# 🆔 Configuration des IDs utilisateur/groupe
export USER_ID=$(id -u)
export GROUP_ID=$(id -g)

echo "🐳 Docker Dev - Clean Architecture NestJS"
echo "========================================"
echo "👤 User ID: $USER_ID | Group ID: $GROUP_ID"
echo ""

# 📋 Fonction d'aide
show_help() {
    echo "🔧 Commandes disponibles:"
    echo ""
    echo "  build   - Construire l'image Docker"
    echo "  start   - Démarrer les services (app + postgres)"
    echo "  stop    - Arrêter tous les services"
    echo "  restart - Redémarrer les services"
    echo "  logs    - Afficher les logs de l'application"
    echo "  shell   - Ouvrir un shell dans le conteneur"
    echo "  clean   - Nettoyer les volumes et images"
    echo "  help    - Afficher cette aide"
    echo ""
    echo "🌟 Exemples:"
    echo "  ./dev-docker.sh start     # Démarrer tout"
    echo "  ./dev-docker.sh logs -f   # Suivre les logs"
    echo "  ./dev-docker.sh shell     # Terminal dans le conteneur"
}

# 🔨 Construction de l'image
build_image() {
    echo "🔨 Construction de l'image Docker..."
    docker-compose -f docker-compose.dev.yml build --build-arg USER_ID=$USER_ID --build-arg GROUP_ID=$GROUP_ID
    echo "✅ Image construite avec succès !"
}

# 🚀 Démarrage des services
start_services() {
    echo "🚀 Démarrage des services de développement..."
    docker-compose -f docker-compose.dev.yml up -d postgres
    echo "⏳ Attente de PostgreSQL..."
    sleep 5
    docker-compose -f docker-compose.dev.yml up app
}

# 🛑 Arrêt des services
stop_services() {
    echo "🛑 Arrêt des services..."
    docker-compose -f docker-compose.dev.yml down
    echo "✅ Services arrêtés !"
}

# 🔄 Redémarrage
restart_services() {
    echo "🔄 Redémarrage des services..."
    stop_services
    start_services
}

# 📊 Affichage des logs
show_logs() {
    echo "📊 Logs de l'application..."
    docker-compose -f docker-compose.dev.yml logs app "${@:2}"
}

# 🐚 Shell dans le conteneur
open_shell() {
    echo "🐚 Ouverture du shell dans le conteneur..."
    docker-compose -f docker-compose.dev.yml exec app /bin/bash
}

# 🧹 Nettoyage
clean_all() {
    echo "🧹 Nettoyage des volumes et images..."
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    echo "✅ Nettoyage terminé !"
}

# 🎯 Traitement des arguments
case "${1:-help}" in
    "build")
        build_image
        ;;
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "logs")
        show_logs "$@"
        ;;
    "shell")
        open_shell
        ;;
    "clean")
        clean_all
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        echo "❌ Commande inconnue: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
