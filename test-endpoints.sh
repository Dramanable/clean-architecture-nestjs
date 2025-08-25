#!/bin/bash

# 🧪 Script de test des endpoints - Clean Architecture NestJS

echo "🧪 Test des endpoints de l'API Clean Architecture NestJS"
echo "========================================================="
echo ""

BASE_URL="http://localhost:3000"

# Fonction pour tester un endpoint
test_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "200" ]; then
        echo "✅ OK (200)"
        # Afficher la réponse si succès
        curl -s "$url" | head -c 100
        echo ""
    elif [ "$response" = "404" ]; then
        echo "❌ Not Found (404)"
    else
        echo "⚠️  Response: $response"
    fi
    echo ""
}

echo "🌐 Testing endpoints..."
echo ""

# Test des endpoints possibles
test_endpoint "$BASE_URL/" "Root endpoint"
test_endpoint "$BASE_URL/health" "Health check (no prefix)"
test_endpoint "$BASE_URL/api/v1/health" "Health check (with prefix)"
test_endpoint "$BASE_URL/api/v1/" "Root with prefix"
test_endpoint "$BASE_URL/api/v1/auth" "Auth endpoint"
test_endpoint "$BASE_URL/api/v1/users" "Users endpoint"
test_endpoint "$BASE_URL/docs" "Swagger docs"
test_endpoint "$BASE_URL/api/docs" "Swagger docs (alt)"

echo ""
echo "📊 Application status check..."
docker-compose -f docker-compose.dev.yml ps app

echo ""
echo "📝 Recent application logs:"
docker-compose -f docker-compose.dev.yml logs --tail=5 app

echo ""
echo "🎯 URLs principales:"
echo "   📱 Application: $BASE_URL"
echo "   🗄️ pgAdmin: http://localhost:5050"
echo "   💊 Health: $BASE_URL/health"
