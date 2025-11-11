#!/bin/bash

echo "===================================="
echo "RMM - Arrêt des serveurs"
echo "===================================="
echo ""

PID_FILE=".rmm_pids"

if [ ! -f $PID_FILE ]; then
    echo "[INFO] Aucun serveur en cours d'exécution (fichier PID introuvable)"
    exit 0
fi

echo "[INFO] Arrêt des serveurs..."
while read pid; do
    if ps -p $pid > /dev/null 2>&1; then
        kill $pid 2>/dev/null
        echo "✓ Processus $pid arrêté"
    fi
done < $PID_FILE

rm -f $PID_FILE

echo ""
echo "===================================="
echo "Serveurs arrêtés"
echo "===================================="
echo ""
