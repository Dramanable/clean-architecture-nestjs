#!/bin/bash

# 🐳 Script de Build Docker Dev - Résolution Permissions
# Usage: ./docker-dev-build.sh

set -e

echo "🐳 Build Docker Dev - Clean Architecture NestJS"
echo "=============================================="

# 🆔 Récupération des IDs utilisateur/groupe actuels
USER_ID=$(id -u)
GROUP_ID=$(id -g)

echo "👤 Utilisateur actuel: $USER (ID: $USER_ID)"
echo "👥 Groupe actuel: $(id -gn) (ID: $GROUP_ID)"

# 🏗️ Build de l'image avec les bons IDs
echo ""
echo "🔨 Construction de l'image Docker avec permissions correctes..."

docker build \
  --build-arg USER_ID=$USER_ID \
  --build-arg GROUP_ID=$GROUP_ID \
  -f Dockerfile.dev \
  -t clean-arch-nestjs:dev \
  .

echo ""
echo "✅ Image Docker 'clean-arch-nestjs:dev' créée avec succès !"
echo ""
echo "🚀 Pour lancer le conteneur :"
echo "   docker run --rm -it -p 3000:3000 -v \$(pwd):/app clean-arch-nestjs:dev"
echo ""
echo "🔄 Ou utilisez docker-compose :"
echo "   docker-compose up dev"
