@echo off
echo ====================================
echo RMM - Installation des dependances
echo ====================================
echo.

echo [1/4] Verification des prerequis...
echo.

:: Verification Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe !
    echo Telechargez-le depuis: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js detecte

:: Verification npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] npm n'est pas installe !
    pause
    exit /b 1
)
echo ✓ npm detecte

:: Verification .NET
where dotnet >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] .NET SDK n'est pas installe !
    echo Telechargez-le depuis: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)
echo ✓ .NET SDK detecte
echo.

echo [2/4] Nettoyage des anciennes installations...
echo.
if exist "frontend\node_modules" (
    echo Suppression de frontend\node_modules...
    rmdir /s /q "frontend\node_modules" 2>nul
)
if exist "frontend\package-lock.json" (
    echo Suppression de frontend\package-lock.json...
    del /q "frontend\package-lock.json" 2>nul
)
if exist "frontend\.next" (
    echo Suppression du cache Next.js...
    rmdir /s /q "frontend\.next" 2>nul
)
echo ✓ Nettoyage termine
echo.

echo [3/4] Installation des dependances Frontend...
echo.
echo Installation en cours (2-5 minutes selon votre connexion)...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Echec de l'installation des dependances frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo.
echo ✓ Dependances frontend installees (635 packages)
echo.

echo [4/4] Restauration et compilation du Backend...
echo.
cd backend
dotnet restore
if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Echec de la restauration des dependances backend
    cd ..
    pause
    exit /b 1
)
echo ✓ Dependances backend restaurees
echo.
echo Compilation du backend...
dotnet build
if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Echec de la compilation du backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo.
echo ✓ Backend compile avec succes
echo.

echo ====================================
echo Installation terminee avec succes !
echo ====================================
echo.
echo Dependances installees:
echo - Frontend: 635 packages (React 19, Next.js 15, etc.)
echo - Backend: Entity Framework Core 8.0, Swagger
echo.
echo Pour demarrer l'application, executez: start.bat
echo.
pause
