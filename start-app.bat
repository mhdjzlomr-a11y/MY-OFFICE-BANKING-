@echo off
title OFFICE FINANCE TRACKER
cd /d "%~dp0"
echo ========================================================
echo        OPENING OFFICE FINANCE TRACKER IN CHROME...
echo ========================================================

set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist "%CHROME_PATH%" set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

if exist "%CHROME_PATH%" (
    start "" "%CHROME_PATH%" --app="file:///%~dp0index.html"
) else (
    start "" "%~dp0index.html"
)

exit
