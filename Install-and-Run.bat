@echo off
title Multi-Chat Plugin for OBS Installer
color 0a

echo ==========================================
echo    Multi-Chat Plugin for OBS Installer
echo ==========================================
echo.

:: Check for Node.js
node -v >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    color 0c
    echo [ERROR] Node.js is not installed or not in your PATH!
    echo Please install Node.js v16+ from https://nodejs.org/
    echo Once installed, run this script again.
    pause
    exit /b
)

echo [SUCCESS] Node.js successfully detected!
echo.
echo [INFO] Navigating to backend directory...
cd /d "%~dp0\backend"

echo [INFO] Installing required backend dependencies...
call npm install

echo.
echo [SUCCESS] Installation complete!
echo.
echo ==========================================
echo Starting Multi-Chat Server...
echo ==========================================

:: Give the server a moment to start, then open the dashboard
timeout /t 3 /nobreak >nul
start http://localhost:3000/dashboard

:: Keep the server running in this window
node server.js

pause
