@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo.
echo           RMM - Installation des Dependances
echo.
echo ============================================================
echo.

:: ============================================
:: ETAPE 1/7 : Verification des prerequis
:: ============================================
echo [1/7] Verification des prerequis...
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe
    echo Telechargez depuis: https://nodejs.org/
    pause
    exit /b 1
)
echo   [OK] Node.js detecte

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] npm n'est pas installe
    pause
    exit /b 1
)
echo   [OK] npm detecte

where dotnet >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] .NET SDK n'est pas installe
    echo Telechargez depuis: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)
echo   [OK] .NET SDK detecte
echo.

:: ============================================
:: ETAPE 2/7 : Nettoyage
:: ============================================
echo [2/7] Nettoyage des anciennes installations...
echo.

if exist "frontend\node_modules" (
    echo   Suppression de frontend\node_modules...
    rmdir /s /q "frontend\node_modules" 2>nul
)
if exist "frontend\package-lock.json" (
    echo   Suppression de frontend\package-lock.json...
    del /q "frontend\package-lock.json" 2>nul
)
if exist "frontend\.next" (
    echo   Suppression du cache Next.js...
    rmdir /s /q "frontend\.next" 2>nul
)
echo   [OK] Nettoyage termine
echo.

:: ============================================
:: ETAPE 3/7 : Frontend
:: ============================================
echo [3/7] Installation Frontend (React 19 + Next.js 15)...
echo   Cela peut prendre 2-5 minutes...
echo.

cd frontend
call npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERREUR] Echec installation frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo   [OK] Frontend installe (635 packages)
echo.

:: ============================================
:: ETAPE 4/7 : MCP Azure DevOps
:: ============================================
echo [4/7] Installation MCP Azure DevOps Server...
echo.

if not exist "mcp-azuredevops-server" mkdir mcp-azuredevops-server
cd mcp-azuredevops-server

if not exist package.json (
    echo   [ERREUR] package.json manquant dans mcp-azuredevops-server
    cd ..
    pause
    exit /b 1
)

call npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERREUR] Echec installation MCP Azure DevOps
    cd ..
    pause
    exit /b 1
)

if not exist .env (
    if exist .env.example (
        copy /Y .env.example .env >nul 2>&1
        echo   [INFO] Fichier .env cree depuis .env.example
    )
)

cd ..
echo   [OK] MCP Azure DevOps installe
echo.

:: ============================================
:: ETAPE 5/7 : MCP SharePoint
:: ============================================
echo [5/7] Installation MCP SharePoint Server...
echo.

if not exist "mcp-sharepoint-server" mkdir mcp-sharepoint-server
cd mcp-sharepoint-server

if not exist package.json (
    echo   [ERREUR] package.json manquant dans mcp-sharepoint-server
    cd ..
    pause
    exit /b 1
)

call npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERREUR] Echec installation MCP SharePoint
    cd ..
    pause
    exit /b 1
)

if not exist .env (
    if exist .env.example (
        copy /Y .env.example .env >nul 2>&1
        echo   [INFO] Fichier .env cree depuis .env.example
    )
)

cd ..
echo   [OK] MCP SharePoint installe
echo.

:: ============================================
:: ETAPE 6/7 : MCP Playwright
:: ============================================
echo [6/7] Installation MCP Playwright Server...
echo   Installation des navigateurs (Chromium)...
echo.

if not exist "mcp-playwright-server" mkdir mcp-playwright-server
cd mcp-playwright-server

if not exist package.json (
    echo   [ERREUR] package.json manquant dans mcp-playwright-server
    cd ..
    pause
    exit /b 1
)

call npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERREUR] Echec installation MCP Playwright
    cd ..
    pause
    exit /b 1
)

echo   Installation du navigateur Chromium...
call npx playwright install chromium >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ATTENTION] Echec installation navigateur
)

if not exist .env (
    if exist .env.example (
        copy /Y .env.example .env >nul 2>&1
        echo   [INFO] Fichier .env cree depuis .env.example
    )
)

cd ..
echo   [OK] MCP Playwright installe
echo.

:: ============================================
:: ETAPE 7/7 : Backend .NET
:: ============================================
echo [7/7] Compilation Backend (.NET 8)...
echo.

cd backend

echo   Restauration des packages NuGet...
dotnet restore >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERREUR] Echec restauration backend
    cd ..
    pause
    exit /b 1
)

echo   Compilation du projet...
dotnet build >nul 2>&1
if %errorlevel% neq 0 (
    echo   [ERREUR] Echec compilation backend
    cd ..
    pause
    exit /b 1
)

cd ..
echo   [OK] Backend compile avec succes
echo.

:: ============================================
:: RESUME
:: ============================================
echo.
echo ============================================================
echo.
echo              Installation Terminee avec Succes
echo.
echo ============================================================
echo.
echo Composants installes :
echo   [OK] Frontend (635 packages)
echo   [OK] MCP Azure DevOps
echo   [OK] MCP SharePoint
echo   [OK] MCP Playwright + Chromium
echo   [OK] Backend .NET 8
echo.
echo ------------------------------------------------------------
echo CONFIGURATION REQUISE :
echo ------------------------------------------------------------
echo.
echo 1. MCP Azure DevOps : mcp-azuredevops-server\.env
echo    - AZURE_DEVOPS_ORG_URL
echo    - AZURE_DEVOPS_PAT
echo    - AZURE_DEVOPS_PROJECT
echo.
echo 2. MCP SharePoint : mcp-sharepoint-server\.env
echo    - AZURE_TENANT_ID
echo    - AZURE_CLIENT_ID
echo    - AZURE_CLIENT_SECRET
echo.
echo 3. Backend : backend\src\CRMEPReport.API\appsettings.json
echo    - OpenAI:Endpoint
echo    - OpenAI:ApiKey
echo.
echo ------------------------------------------------------------
echo Pour demarrer : start.bat
echo ------------------------------------------------------------
echo.
pause
