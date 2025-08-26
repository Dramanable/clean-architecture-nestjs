#!/bin/bash

# 🚀 Script de Lancement Docker Dev - Clean Architecture NestJS
# Usage: ./docker-dev-run.sh

set -e

echo "🚀 Lancement Docker Dev - Clean Architecture NestJS"
echo "================================================="

# 🛑 Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker stop clean-arch-dev 2>/dev/null || true
docker rm clean-arch-dev 2>/dev/null || true

# 🆔 Récupération des IDs utilisateur/groupe actuels
USER_ID=$(id -u)
GROUP_ID=$(id -g)

echo "👤 Utilisateur actuel: $USER (ID: $USER_ID)"
echo "👥 Groupe actuel: $(id -gn) (ID: $GROUP_ID)"

# 🔍 Vérifier si l'image existe
if ! docker images | grep -q "clean-arch-nestjs.*dev"; then
    echo "⚠️  Image 'clean-arch-nestjs:dev' non trouvée."
    echo "🔨 Construction de l'image..."
    ./docker-dev-build.sh
fi

# 🚀 Lancement du conteneur avec mount du code source
echo ""
echo "🐳 Lancement du conteneur de développement..."

docker run \
  --rm \
  --name clean-arch-dev \
  -it \
  -p 3000:3000 \
  -p 9229:9229 \
  -p 5555:5555 \
  -v "$(pwd):/app" \
  -v /app/node_modules \
  -e NODE_ENV=development \
  clean-arch-nestjs:dev

echo ""
echo "🏁 Conteneur arrêté."
