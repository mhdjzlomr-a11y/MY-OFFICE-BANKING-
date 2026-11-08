@echo off
title Office Finance Web & Android App
echo ========================================================
echo        OFFICE FINANCE WEB & ANDROID APP
echo        ഓഫീസ് വരവ്-ചിലവ് മാനേജ്‌മെന്റ് സിസ്റ്റം
echo ========================================================
echo.
echo 1. Opening Office Finance in Browser...
start "" "%~dp0index.html"
echo.
echo Application opened successfully!
echo To run as local web server with PWA install support,
echo you can also run: powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
echo.
timeout /t 3 >nul
exit
