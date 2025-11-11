@echo off
echo ====================================
echo RMM - Installation des dependances
echo ====================================
echo.

echo [1/3] Verification des prerequis...
echo.

:: Verification Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe !
    echo Telechargez-le depuis: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js detecte

:: Verification .NET
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] .NET SDK n'est pas installe !
    echo Telechargez-le depuis: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)
echo ✓ .NET SDK detecte
echo.

echo [2/3] Installation des dependances Frontend...
echo.
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] Echec de l'installation des dependances frontend
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Dependances frontend installees
echo.

echo [3/3] Restauration des dependances Backend...
echo.
cd backend
dotnet restore
if %errorlevel% neq 0 (
    echo [ERREUR] Echec de la restauration des dependances backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Dependances backend restaurees
echo.

echo ====================================
echo Installation terminee avec succes !
echo ====================================
echo.
echo Pour demarrer l'application, executez: start.bat
echo.
pause
