@echo off
title Office Finance Local Server
cd /d "%~dp0"
echo ========================================================
echo        STARTING OFFICE FINANCE LOCAL SERVER...
echo ========================================================
powershell.exe -NoExit -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
