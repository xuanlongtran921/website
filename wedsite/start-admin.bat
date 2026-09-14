@echo off
title SmartPicks Creator CMS Studio
echo ========================================================
echo   Dang khoi dong SMARTPICKS CREATOR CMS STUDIO...
echo   Admin Site: http://localhost:3001
echo   Web Chinh:  http://localhost:3000
echo ========================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
