@echo off
chcp 65001 >nul
title MealMate - public link (tunnel)
cd /d "%~dp0"

echo ============================================================
echo   This gives a PUBLIC link to your site.
echo   Requirements: the site is running in the other window
echo   (start-site.bat) and this window stays open.
echo   The link changes every time you run this file.
echo ============================================================
echo.
where cloudflared >nul 2>nul
if errorlevel 1 (
  if not exist cloudflared.exe (
    echo  [!] cloudflared.exe not found in this folder.
    echo      Copy cloudflared.exe here (from the workspace root)
    echo      or install it: winget install Cloudflare.cloudflared
    pause
    exit /b 1
  )
)
cloudflared tunnel --url http://localhost:3001 --no-autoupdate
pause
