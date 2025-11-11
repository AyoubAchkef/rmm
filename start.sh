#!/bin/bash

echo "===================================="
echo "RMM - Démarrage de l'application"
echo "===================================="
echo ""

# Vérification que les dépendances sont installées
if [ ! -d "frontend/node_modules" ]; then
    echo "[ERREUR] Les dépendances frontend ne sont pas installées !"
    echo "Exécutez d'abord: ./install.sh"
    exit 1
fi

echo "[INFO] Démarrage des serveurs..."
echo ""
echo "Backend: http://localhost:5154"
echo "Frontend: http://localhost:3000 (ou 3001 si 3000 est occupé)"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les deux serveurs"
echo ""

# Créer un fichier pour stocker les PIDs
PID_FILE=".rmm_pids"
rm -f $PID_FILE

# Démarrer le backend
cd backend/src/CRMEPReport.API
dotnet run &
BACKEND_PID=$!
echo $BACKEND_PID >> ../../../$PID_FILE
cd ../../..

echo "✓ Backend démarré (PID: $BACKEND_PID)"

# Attendre que le backend démarre
sleep 3

# Démarrer le frontend
cd frontend
npm run dev &
FRONTEND_PID=$!
echo $FRONTEND_PID >> ../$PID_FILE
cd ..

echo "✓ Frontend démarré (PID: $FRONTEND_PID)"
echo ""
echo "===================================="
echo "Les serveurs sont en cours de démarrage..."
echo "===================================="
echo ""
echo "Une fois démarrés, ouvrez votre navigateur sur :"
echo "http://localhost:3000"
echo ""
echo "Pour arrêter les serveurs, exécutez: ./stop.sh"
echo "ou appuyez sur Ctrl+C"
echo ""

# Fonction pour arrêter les serveurs proprement
cleanup() {
    echo ""
    echo "Arrêt des serveurs..."
    if [ -f $PID_FILE ]; then
        while read pid; do
            kill $pid 2>/dev/null
        done < $PID_FILE
        rm -f $PID_FILE
    fi
    echo "Serveurs arrêtés"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT SIGTERM

# Attendre
wait
