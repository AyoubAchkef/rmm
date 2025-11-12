@echo off
echo ====================================
echo RMM - Arret des serveurs
echo ====================================
echo.

echo [INFO] Arret du MCP Azure DevOps...
taskkill /FI "WindowTitle eq RMM MCP Azure DevOps*" /T /F >nul 2>&1

echo [INFO] Arret du MCP SharePoint...
taskkill /FI "WindowTitle eq RMM MCP SharePoint*" /T /F >nul 2>&1

echo [INFO] Arret du backend (.NET)...
taskkill /FI "WindowTitle eq RMM Backend*" /T /F >nul 2>&1

echo [INFO] Arret du frontend (Next.js)...
taskkill /FI "WindowTitle eq RMM Frontend*" /T /F >nul 2>&1

echo.
echo ====================================
echo Serveurs arretes
echo ====================================
echo.
pause
