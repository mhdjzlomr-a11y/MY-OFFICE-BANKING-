@echo off
title Push Office Finance to GitHub
echo ========================================================
echo        PUSH TO GITHUB: MY-OFFICE-BANKING
echo ========================================================
echo.

set "GIT_PATH=C:\Program Files\Git\cmd\git.exe"

if not exist "%GIT_PATH%" (
    set "GIT_PATH=git"
)

echo Adding all files...
"%GIT_PATH%" add .

echo Checking status...
"%GIT_PATH%" commit -m "Update: Office Finance Web and Android App"

echo Setting branch to main...
"%GIT_PATH%" branch -M main

echo Pushing to https://github.com/mhdjzlomr-a11y/MY-OFFICE-BANKING-.git...
"%GIT_PATH%" push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo  SUCCESS! All code has been pushed to GitHub!
    echo ========================================================
) else (
    echo.
    echo If GitHub asks for login, please complete sign-in in the popup window.
    echo Alternatively, if the remote branch has existing commits, you can run:
    echo "%GIT_PATH%" pull origin main --rebase
    echo "%GIT_PATH%" push -u origin main
)

echo.
pause
