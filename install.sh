#!/bin/bash

echo "===================================="
echo "RMM - Installation des dépendances"
echo "===================================="
echo ""

echo "[1/3] Vérification des prérequis..."
echo ""

# Vérification Node.js
if ! command -v node &> /dev/null; then
    echo "[ERREUR] Node.js n'est pas installé !"
    echo "Téléchargez-le depuis: https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js détecté: $(node --version)"

# Vérification .NET
if ! command -v dotnet &> /dev/null; then
    echo "[ERREUR] .NET SDK n'est pas installé !"
    echo "Téléchargez-le depuis: https://dotnet.microsoft.com/download"
    exit 1
fi
echo "✓ .NET SDK détecté: $(dotnet --version)"
echo ""

echo "[2/3] Installation des dépendances Frontend..."
echo ""
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec de l'installation des dépendances frontend"
    cd ..
    exit 1
fi
cd ..
echo "✓ Dépendances frontend installées"
echo ""

echo "[3/3] Restauration des dépendances Backend..."
echo ""
cd backend
dotnet restore
if [ $? -ne 0 ]; then
    echo "[ERREUR] Échec de la restauration des dépendances backend"
    cd ..
    exit 1
fi
cd ..
echo "✓ Dépendances backend restaurées"
echo ""

echo "===================================="
echo "Installation terminée avec succès !"
echo "===================================="
echo ""
echo "Pour démarrer l'application, exécutez: ./start.sh"
echo ""
