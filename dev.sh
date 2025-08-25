#!/bin/bash

# 🚀 Script de développement pour Clean Architecture NestJS
# Usage: ./dev.sh [command]

set -e

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonctions utilitaires
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Vérifier si Docker est en cours d'exécution
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker n'est pas en cours d'exécution. Veuillez démarrer Docker."
        exit 1
    fi
}

# Vérifier si les dépendances sont installées
check_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_warning "Les dépendances ne sont pas installées. Installation en cours..."
        npm install
    fi
}

# Commandes disponibles
case "${1:-help}" in
    "start"|"s")
        print_header "🚀 Démarrage de l'environnement de développement"
        check_docker
        make start-db
        print_info "Attente du démarrage des bases de données..."
        sleep 10
        print_success "Bases de données prêtes!"
        print_info "Démarrage de l'application en mode développement..."
        npm run start:dev
        ;;
        
    "docker"|"d")
        print_header "🐳 Démarrage complet avec Docker"
        check_docker
        make start-build
        print_success "Environnement Docker démarré!"
        print_info "Application disponible sur: http://localhost:3000"
        print_info "pgAdmin disponible sur: http://localhost:5050"
        print_info "Mongo Express disponible sur: http://localhost:8081"
        print_info "Redis Commander disponible sur: http://localhost:8082"
        ;;
        
    "stop")
        print_header "🛑 Arrêt des services"
        make stop
        print_success "Services arrêtés!"
        ;;
        
    "clean")
        print_header "🧹 Nettoyage complet"
        make stop-clean
        make clean-volumes
        make clean-images
        print_success "Nettoyage terminé!"
        ;;
        
    "logs"|"l")
        print_header "📋 Affichage des logs"
        if [ -n "$2" ]; then
            make logs-$2
        else
            make logs
        fi
        ;;
        
    "shell"|"sh")
        print_header "🐚 Connexion au conteneur"
        make shell
        ;;
        
    "test"|"t")
        print_header "🧪 Exécution des tests"
        check_dependencies
        case "${2:-all}" in
            "unit"|"u")
                npm run test:unit
                ;;
            "e2e"|"integration"|"i")
                npm run test:e2e
                ;;
            "watch"|"w")
                npm run test:watch
                ;;
            "coverage"|"cov"|"c")
                npm run test:coverage
                ;;
            *)
                npm test
                ;;
        esac
        ;;
        
    "lint")
        print_header "🔍 Vérification du code"
        check_dependencies
        npm run lint
        npm run format
        print_success "Code vérifié et formaté!"
        ;;
        
    "migrate"|"m")
        print_header "🗄️  Exécution des migrations"
        case "${2:-sql}" in
            "sql")
                make migrate-sql
                ;;
            "nosql"|"mongo")
                make migrate-nosql
                ;;
            "all")
                make migrate-sql
                make migrate-nosql
                ;;
            *)
                print_error "Type de migration invalide. Utilisez: sql, nosql, ou all"
                exit 1
                ;;
        esac
        print_success "Migrations exécutées!"
        ;;
        
    "build"|"b")
        print_header "🏗️  Construction de l'application"
        check_dependencies
        npm run build
        print_success "Application construite!"
        ;;
        
    "status"|"st")
        print_header "📊 Statut des services"
        make status
        make health
        ;;
        
    "reset"|"r")
        print_header "🔄 Reset complet de l'environnement"
        print_warning "Cette opération va supprimer toutes les données!"
        read -p "Continuer? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            make reset
            print_success "Environnement réinitialisé!"
        else
            print_info "Opération annulée."
        fi
        ;;
        
    "help"|"h"|*)
        print_header "🚀 Clean Architecture NestJS - Script de développement"
        echo -e "${CYAN}Usage: ./dev.sh [command]${NC}"
        echo ""
        echo -e "${YELLOW}Commands disponibles:${NC}"
        echo -e "  ${GREEN}start, s${NC}          Démarrer l'app en mode dev (sans Docker)"
        echo -e "  ${GREEN}docker, d${NC}         Démarrer avec Docker Compose"
        echo -e "  ${GREEN}stop${NC}              Arrêter tous les services"
        echo -e "  ${GREEN}clean${NC}             Nettoyage complet"
        echo -e "  ${GREEN}logs, l [service]${NC} Afficher les logs"
        echo -e "  ${GREEN}shell, sh${NC}         Connexion au conteneur app"
        echo -e "  ${GREEN}test, t [type]${NC}    Exécuter les tests"
        echo -e "    ${CYAN}  unit, u${NC}        Tests unitaires"
        echo -e "    ${CYAN}  e2e, i${NC}         Tests d'intégration"
        echo -e "    ${CYAN}  watch, w${NC}       Tests en mode watch"
        echo -e "    ${CYAN}  coverage, c${NC}    Tests avec couverture"
        echo -e "  ${GREEN}lint${NC}              Linter et formater le code"
        echo -e "  ${GREEN}migrate, m [type]${NC} Exécuter les migrations"
        echo -e "    ${CYAN}  sql${NC}            Migrations SQL"
        echo -e "    ${CYAN}  nosql, mongo${NC}   Migrations MongoDB"
        echo -e "    ${CYAN}  all${NC}            Toutes les migrations"
        echo -e "  ${GREEN}build, b${NC}          Construire l'application"
        echo -e "  ${GREEN}status, st${NC}        Statut des services"
        echo -e "  ${GREEN}reset, r${NC}          Reset complet"
        echo -e "  ${GREEN}help, h${NC}           Afficher cette aide"
        echo ""
        echo -e "${CYAN}Exemples:${NC}"
        echo -e "  ${YELLOW}./dev.sh start${NC}        # Démarrer en mode développement"
        echo -e "  ${YELLOW}./dev.sh docker${NC}       # Démarrer avec Docker"
        echo -e "  ${YELLOW}./dev.sh test unit${NC}    # Tests unitaires"
        echo -e "  ${YELLOW}./dev.sh logs app${NC}     # Logs de l'application"
        ;;
esac
