@echo off
title AURA Predictive AI - Desktop App Launcher
echo ========================================================
echo   Launching AURA Predictive AI as a Standalone App...
echo ========================================================

REM Check if backend is responding, if not start it
curl -s http://127.0.0.1:8088/api/health >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Starting backend on port 8088...
    start /min powershell -NoExit -Command "cd '%~dp0backend'; python -m uvicorn app.main:app --port 8088 --reload"
    timeout /t 2 >nul
)

REM Check if frontend is responding, if not start it
curl -s http://127.0.0.1:3050 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Starting frontend on port 3050...
    start /min powershell -NoExit -Command "cd '%~dp0frontend'; npm run dev"
    timeout /t 3 >nul
)

echo Opening standalone app window...
REM Prefer Microsoft Edge in app mode (installed on all Windows 10/11)
where msedge >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start msedge --app=http://localhost:3050 --window-size=1100,820
    exit /b
)

REM Fallback to Chrome in app mode
where chrome >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start chrome --app=http://localhost:3050 --window-size=1100,820
    exit /b
)

REM Fallback to default browser
start http://localhost:3050
exit /b
