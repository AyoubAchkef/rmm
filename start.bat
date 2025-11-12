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

:: Verification que le backend est compile
if not exist "backend\src\CRMEPReport.API\bin\Debug\net8.0\CRMEPReport.API.dll" (
    echo [ERREUR] Le backend n'est pas compile !
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

:: Demarrer le backend en arriere-plan avec dotnet sur la DLL (evite les problemes d'antivirus)
start "RMM Backend" cmd /k "cd /d %~dp0backend\src\CRMEPReport.API && set ASPNETCORE_ENVIRONMENT=Development && set ASPNETCORE_URLS=http://localhost:5154 && dotnet bin\Debug\net8.0\CRMEPReport.API.dll"

:: Attendre 3 secondes pour que le backend demarre
timeout /t 3 /nobreak >nul

:: Demarrer le frontend en arriere-plan
start "RMM Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

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
echo ou utilisez stop.bat
echo.
pause
