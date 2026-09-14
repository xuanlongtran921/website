@echo off
title TechAffiliate Pro - Localhost Server
echo ========================================================
echo   Dang khoi dong Website Blog tren Localhost...
echo ========================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
