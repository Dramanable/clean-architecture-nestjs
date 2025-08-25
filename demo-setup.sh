#!/bin/bash

# 🚀 Démonstration complète du setup de développement
# Clean Architecture NestJS - Docker Dev Setup

echo "🚀 Clean Architecture NestJS - Setup de Développement"
echo "======================================================="
echo ""

# Vérifier les prérequis
echo "🔍 Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

echo "✅ Docker et Docker Compose sont installés"
echo ""

# Afficher la configuration
echo "📋 Configuration du projet:"
echo "   - Dockerfile.dev : Image optimisée pour le développement"
echo "   - docker-compose.dev.yml : PostgreSQL + Application + pgAdmin"
echo "   - Hot reload activé via volume mounting"
echo "   - Port debugging Node.js exposé (9229)"
echo ""

# Proposer de démarrer
read -p "🚀 Voulez-vous démarrer l'environnement maintenant ? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔧 Démarrage de l'environnement de développement..."
    echo ""
    
    # Démarrer les services
    docker-compose -f docker-compose.dev.yml up -d
    
    echo ""
    echo "⏳ Attente du démarrage des services..."
    sleep 10
    
    echo ""
    echo "✅ Environnement démarré avec succès !"
    echo ""
    echo "🌐 URLs disponibles :"
    echo "   📱 Application NestJS : http://localhost:3000"
    echo "   🗄️ pgAdmin (PostgreSQL) : http://localhost:5050"
    echo ""
    echo "🔑 Identifiants pgAdmin :"
    echo "   📧 Email : dev@cleanarchi.com"
    echo "   🔐 Mot de passe : dev123"
    echo ""
    echo "🗄️ Base de données PostgreSQL :"
    echo "   🏠 Host : localhost"
    echo "   🚪 Port : 5432"
    echo "   👤 User : dev_user"
    echo "   🔐 Password : dev_password123"
    echo "   📊 Database : cleanarchi_dev"
    echo ""
    echo "🔧 Commandes utiles :"
    echo "   📝 Voir les logs : docker-compose -f docker-compose.dev.yml logs -f"
    echo "   🔄 Redémarrer : docker-compose -f docker-compose.dev.yml restart"
    echo "   🛑 Arrêter : docker-compose -f docker-compose.dev.yml down"
    echo ""
    echo "📚 Documentation :"
    echo "   📖 Setup détaillé : DOCKER-DEV.md"
    echo "   🚀 Guide rapide : DEV-SETUP.md"
    echo ""
    
    # Vérifier si l'application répond
    echo "🩺 Test de santé de l'application..."
    sleep 5
    
    if curl -f http://localhost:3000/health &> /dev/null; then
        echo "✅ L'application répond correctement !"
    else
        echo "⚠️  L'application démarre encore... Patientez quelques secondes."
        echo "   Vous pouvez vérifier les logs avec : docker-compose -f docker-compose.dev.yml logs -f"
    fi
    
else
    echo "ℹ️  Pour démarrer manuellement :"
    echo "   docker-compose -f docker-compose.dev.yml up -d"
    echo ""
    echo "📚 Consultez DEV-SETUP.md pour plus d'informations"
fi

echo ""
echo "🎉 Setup terminé ! Happy coding ! 🚀"
