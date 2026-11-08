@echo off
title Office Finance Server & Chrome Launcher
cd /d "%~dp0"

echo ========================================================
echo       OFFICE FINANCE SERVER & CHROME LAUNCHER
echo ========================================================
echo.
echo 1. Starting Local Web Server on Port 5050...
echo 2. Launching Google Chrome...
echo.

set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"

if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" "http://localhost:5050"
) else (
    start "" "http://localhost:5050"
)

powershell.exe -NoExit -ExecutionPolicy Bypass -File "%~dp0server.ps1"
