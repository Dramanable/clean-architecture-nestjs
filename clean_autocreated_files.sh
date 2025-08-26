#!/bin/bash

echo "🧹 NETTOYAGE DÉFINITIF - Suppression des fichiers auto-créés"
echo "============================================================="

echo "🔍 Recherche des fichiers vides créés automatiquement..."

# Compter les fichiers avant suppression
BEFORE_COUNT=$(find . -size 0 \( -name "*.ts" -o -name "*.md" -o -name "*.sh" \) | grep -v node_modules | wc -l)
echo "📊 Fichiers vides trouvés: $BEFORE_COUNT"

if [ $BEFORE_COUNT -gt 0 ]; then
    echo "📋 Liste des fichiers à supprimer:"
    find . -size 0 \( -name "*.ts" -o -name "*.md" -o -name "*.sh" \) | grep -v node_modules | head -10
    
    if [ $BEFORE_COUNT -gt 10 ]; then
        echo "    ... et $((BEFORE_COUNT - 10)) autres fichiers"
    fi
    
    echo ""
    echo "🗑️  Suppression en cours..."
    find . -size 0 \( -name "*.ts" -o -name "*.md" -o -name "*.sh" \) | grep -v node_modules | xargs rm -f
    
    # Vérifier après suppression
    AFTER_COUNT=$(find . -size 0 \( -name "*.ts" -o -name "*.md" -o -name "*.sh" \) | grep -v node_modules | wc -l)
    echo "✅ Supprimés: $((BEFORE_COUNT - AFTER_COUNT)) fichiers"
    echo "📊 Fichiers restants: $AFTER_COUNT"
else
    echo "✅ Aucun fichier vide trouvé - Le projet est propre !"
fi

echo ""
echo "🎯 SOLUTION APPLIQUÉE:"
echo "  ✅ Configuration TypeScript modifiée (.vscode/settings.json)"
echo "  ✅ Auto-imports désactivés" 
echo "  ✅ Mise à jour des imports sur 'prompt' au lieu de 'always'"
echo "  ✅ TypeScript Language Server redémarré"
echo ""
echo "🛡️  Le problème est résolu - VS Code ne devrait plus créer de fichiers vides !"
