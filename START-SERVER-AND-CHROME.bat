@echo off
title Office Finance Server & Chrome Launcher
cd /d "%~dp0"
echo Starting Office Finance on http://localhost:5050 in Chrome...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
