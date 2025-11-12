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

echo [3/5] Installation des dependances Frontend...
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

echo [4/5] Installation du MCP Server (Azure DevOps)...
echo.
if not exist "mcp-server" (
    echo [INFO] Le dossier mcp-server est introuvable. Creation...
    mkdir mcp-server
)
cd mcp-server
if not exist package.json (
    echo [ERREUR] Le fichier package.json du MCP Server est introuvable.
    echo Verifiez que le dossier mcp-server contient le projet MCP.
    cd ..
    pause
    exit /b 1
)
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Echec de l'installation du MCP Server (npm install)
    cd ..
    pause
    exit /b 1
)
if not exist .env (
    if exist .env.example (
        echo [INFO] Creation du fichier .env pour le MCP Server depuis .env.example
        copy /Y .env.example .env >nul
        echo [ATTENTION] Ouvrez c:\Dev\rmm\mcp-server\.env et renseignez:
        echo   - AZURE_DEVOPS_ORG_URL (ex: https://dev.azure.com/votre-org)
        echo   - AZURE_DEVOPS_PAT (Personal Access Token)
        echo   - AZURE_DEVOPS_PROJECT (Nom du projet)
    ) else (
        echo [ATTENTION] Le fichier .env.example est manquant dans mcp-server. Creez mcp-server\.env manuellement.
    )
)
cd ..
echo.
echo ✓ MCP Server installe

echo.
echo [5/5] Restauration et compilation du Backend...
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
echo - MCP Server: dependances Node installees (voir mcp-server/.env)
echo - Backend: Entity Framework Core 8.0, Swagger

echo.
echo IMPORTANT:
echo - Si c'est la premiere installation, renseignez le fichier c:\Dev\rmm\mcp-server\.env
echo   (AZURE_DEVOPS_ORG_URL, AZURE_DEVOPS_PAT, AZURE_DEVOPS_PROJECT)

echo.
echo Pour demarrer l'application, executez: start.bat

echo.
pause
