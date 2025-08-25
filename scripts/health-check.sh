#!/bin/bash

# 🔍 Script de vérification de la santé des services Docker

echo "🔍 Vérification des services Docker..."

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé ou non accessible"
    echo "💡 Assurez-vous que l'intégration WSL est activée dans Docker Desktop"
    exit 1
fi

# Vérifier les services
echo "📊 État des conteneurs:"
docker compose ps

echo ""
echo "🐘 Vérification PostgreSQL..."
if docker compose exec -T postgres pg_isready -U admin -d cleanarchi; then
    echo "✅ PostgreSQL est prêt"
else
    echo "⏳ PostgreSQL n'est pas encore prêt, attendez quelques secondes..."
fi

echo ""
echo "⚡ Vérification Redis..."
if docker compose exec -T redis redis-cli -a password123 ping &> /dev/null; then
    echo "✅ Redis est prêt"
else
    echo "⏳ Redis n'est pas encore prêt"
fi

echo ""
echo "🔗 Services accessibles:"
echo "  📊 pgAdmin4: http://localhost:5050"
echo "     - Email: admin@cleanarchi.com"
echo "     - Password: admin123"
echo ""
echo "  🎯 Application: http://localhost:3000"
echo "  📖 Swagger: http://localhost:3000/api/docs"
echo ""
echo "🎉 Tous les services sont configurés!"
