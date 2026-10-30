@echo off
chcp 65001 >nul
title MealMate - update GitHub
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo  [!] Git is not installed. It is needed only for site updates.
  echo      Install: winget install Git.Git
  pause
  exit /b 1
)

git add -A
git status --short
echo.
set /p MSG=Change description (Enter = "update"): 
if "%MSG%"=="" set MSG=update
git commit -m "%MSG%"
git push
echo.
echo Done. Railway will rebuild the site automatically in 2-3 minutes.
pause
