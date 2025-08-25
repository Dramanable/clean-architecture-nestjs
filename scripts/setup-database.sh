#!/bin/bash

# 🚀 Script de setup de la base de données
# Initialise la base avec les migrations et données de test

set -e # Arrêter en cas d'erreur

echo "🗄️ Setup de la base de données Clean Architecture"
echo "================================================"

# Vérifier que Docker est lancé
echo "🔍 Vérification des services Docker..."
if ! docker compose ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL n'est pas démarré. Lancement..."
    npm run docker:up
    echo "⏳ Attente que PostgreSQL soit prêt..."
    sleep 15
fi

# Vérifier la connexion à PostgreSQL
echo "🔗 Test de connexion PostgreSQL..."
if docker compose exec -T postgres pg_isready -U admin -d cleanarchi; then
    echo "✅ PostgreSQL est accessible"
else
    echo "❌ Impossible de se connecter à PostgreSQL"
    echo "💡 Essayez: npm run docker:logs"
    exit 1
fi

# Afficher les migrations existantes
echo ""
echo "📊 État actuel des migrations:"
npm run migration:show || echo "Aucune migration trouvée"

# Exécuter les migrations
echo ""
echo "🔄 Exécution des migrations..."
npm run migration:run

echo ""
echo "📋 Migrations appliquées avec succès:"
npm run migration:show

# Vérifier la structure des tables
echo ""
echo "🗂️ Vérification des tables créées:"
docker compose exec -T postgres psql -U admin -d cleanarchi -c "\dt"

echo ""
echo "👤 Structure de la table users:"
docker compose exec -T postgres psql -U admin -d cleanarchi -c "\d users"

echo ""
echo "🔑 Structure de la table refresh_tokens:"
docker compose exec -T postgres psql -U admin -d cleanarchi -c "\d refresh_tokens"

echo ""
echo "🎉 Base de données initialisée avec succès!"
echo ""
echo "🔗 Accès disponibles:"
echo "  📊 pgAdmin: http://localhost:5050"
echo "     - Email: admin@cleanarchi.com"
echo "     - Password: admin123"
echo ""
echo "  🎯 Application: http://localhost:3000"
echo "  📖 Swagger: http://localhost:3000/api/docs"
echo ""
echo "✨ Vous pouvez maintenant démarrer l'application avec: npm run start:dev"
