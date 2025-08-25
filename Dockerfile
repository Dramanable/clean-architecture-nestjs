# 🐳 Dockerfile pour Clean Architecture NestJS Application
# Multi-stage build pour optimiser la taille et la sécurité

# ========================================
# 🏗️ Stage 1: Base Dependencies
# ========================================
FROM node:22.17-alpine AS dependencies

# Informations du mainteneur
LABEL maintainer="Clean Architecture Team"
LABEL version="1.0.0"
LABEL description="Clean Architecture NestJS Application with PostgreSQL and MongoDB"

# Variables d'environnement pour la construction
ENV NODE_ENV=production

# Installation des outils système nécessaires
RUN apk add --no-cache \
  dumb-init \
  curl \
  tzdata

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances avec cache optimisé
RUN --mount=type=cache,id=npm,target=~/.npm \
  npm ci --only=production=false

# ========================================
# 🔨 Stage 2: Build Application
# ========================================
FROM dependencies AS builder

# Copie du code source
COPY . .

# Construction de l'application
RUN npm run build

# NE PAS nettoyer les dev dependencies en mode développement
# RUN npm prune --production

# ========================================
# 🚀 Stage 3: Production Runtime
# ========================================
FROM node:22.17-alpine AS production

# Variables d'environnement de production
ENV NODE_ENV=production
ENV PORT=3000

# Installation des outils nécessaires pour la production
RUN apk add --no-cache \
  dumb-init \
  curl \
  tzdata

# Création de l'utilisateur non-root
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers nécessaires depuis le stage de build
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# Copie des fichiers de configuration et migrations
COPY --from=builder --chown=nestjs:nodejs /app/src/infrastructure/database/migrations ./src/infrastructure/database/migrations
COPY --from=builder --chown=nestjs:nodejs /app/src/shared/i18n ./src/shared/i18n
COPY --from=builder --chown=nestjs:nodejs /app/src/infrastructure/i18n ./src/infrastructure/i18n

# Configuration des permissions
RUN chown -R nestjs:nodejs /app

# Changement vers l'utilisateur non-root
USER nestjs

# Exposition du port
EXPOSE $PORT

# Configuration du health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# Point d'entrée avec dumb-init pour une gestion correcte des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "dist/main.js"]

# ========================================
# 🧪 Stage 4: Development (optimisé)
# ========================================
FROM node:22.17-alpine AS development

# Variables d'environnement de développement
ENV NODE_ENV=development
ENV DEBUG=*

# Installation des outils système nécessaires
RUN apk add --no-cache \
  dumb-init \
  curl \
  tzdata

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation de TOUTES les dépendances (dev + prod) pour le développement
RUN --mount=type=cache,id=npm,target=~/.npm \
  npm ci

# Installation des outils de développement et debugging
RUN apk add --no-cache \
  git \
  bash \
  vim \
  nano \
  curl \
  wget \
  htop \
  procps

# Installation de nodemon et nest CLI globalement pour le hot reload
RUN npm install -g nodemon @nestjs/cli

# Copie du code source pour le développement
COPY --chown=nestjs:nodejs . .

# Création des répertoires nécessaires et ajustement des permissions
RUN mkdir -p logs dist && \
  chown -R nestjs:nodejs /app && \
  chmod -R 755 /app

# Changement vers l'utilisateur non-root
USER nestjs

# Exposition des ports pour le développement et debug
EXPOSE 3000 9229 24678

# Configuration du health check pour le développement
HEALTHCHECK --interval=60s --timeout=15s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Point d'entrée pour le développement
ENTRYPOINT ["dumb-init", "--"]

# Pas de commande par défaut, sera surchargée par docker-compose
# CMD ["npm", "run", "start:dev"]

# ========================================
# 📊 Métadonnées et Labels
# ========================================

# Labels pour l'identification et la documentation
LABEL org.opencontainers.image.title="Clean Architecture NestJS"
LABEL org.opencontainers.image.description="Enterprise-grade NestJS application with Clean Architecture"
LABEL org.opencontainers.image.vendor="Clean Architecture Team"
LABEL org.opencontainers.image.authors="Development Team"
LABEL org.opencontainers.image.url="https://github.com/your-org/clean-architecture-nestjs"
LABEL org.opencontainers.image.documentation="https://docs.your-domain.com"
LABEL org.opencontainers.image.source="https://github.com/your-org/clean-architecture-nestjs"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.revision="latest"
LABEL org.opencontainers.image.licenses="MIT"

# Labels pour les technologies utilisées
LABEL tech.nodejs.version="22.17"
LABEL tech.nestjs.framework="true"
LABEL tech.postgresql.supported="true"
LABEL tech.mongodb.supported="true"
LABEL tech.redis.supported="true"
LABEL architecture.pattern="Clean Architecture"
LABEL architecture.layers="4"

# Labels pour la sécurité
LABEL security.user="nestjs"
LABEL security.rootless="true"
LABEL security.healthcheck="enabled"
