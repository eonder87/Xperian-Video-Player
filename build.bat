@echo off
title Xperian Video Player - Build
cd /d "%~dp0"
if not exist "node_modules\" (
    call npm install
    if errorlevel 1 exit /b 1
)

call npm run build
exit /b %errorlevel%
