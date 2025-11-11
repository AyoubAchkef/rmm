@echo off
echo ====================================
echo RMM - Demarrage de l'application
echo ====================================
echo.

:: Verification que les dependances sont installees
if not exist "frontend\node_modules" (
    echo [ERREUR] Les dependances frontend ne sont pas installees !
    echo Executez d'abord: install.bat
    pause
    exit /b 1
)

echo [INFO] Demarrage des serveurs...
echo.
echo Backend: http://localhost:5154
echo Frontend: http://localhost:3000 (ou 3001 si 3000 est occupe)
echo.
echo Appuyez sur Ctrl+C dans cette fenetre pour arreter les deux serveurs
echo.

:: Demarrer le backend en arriere-plan
start "RMM Backend" cmd /k "cd backend\src\CRMEPReport.API && dotnet run"

:: Attendre 3 secondes pour que le backend demarre
timeout /t 3 /nobreak >nul

:: Demarrer le frontend en arriere-plan
start "RMM Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo Les serveurs sont en cours de demarrage...
echo ====================================
echo.
echo Deux nouvelles fenetres se sont ouvertes :
echo - RMM Backend (API .NET)
echo - RMM Frontend (Next.js)
echo.
echo Une fois demarres, ouvrez votre navigateur sur :
echo http://localhost:3000
echo.
echo Pour arreter les serveurs, fermez les fenetres Backend et Frontend
echo.
pause
