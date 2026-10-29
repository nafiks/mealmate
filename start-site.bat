@echo off
chcp 65001 >nul
title MealMate - starting...
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [!] Node.js is not installed.
  echo      1. Open https://nodejs.org and install the LTS version
  echo      2. CLOSE this window and any terminals
  echo      3. Run this file again
  echo.
  pause
  exit /b 1
)

if not exist node_modules (
  echo First run: installing libraries, 1-2 minutes...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo npm install failed. Check your internet connection.
    pause
    exit /b 1
  )
)

echo Building the site...
call npm run build
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo   MealMate is running:  http://localhost:3001
echo   Stop the site: press Ctrl+C in this window
echo ============================================================
start "" http://localhost:3001
call npm start
