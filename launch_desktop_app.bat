@echo off
title AURA Predictive AI - Desktop App Launcher
echo ========================================================
echo   Launching AURA Predictive AI...
echo ========================================================

REM 1. Start Python backend if not already active
curl -s http://127.0.0.1:8088/api/health >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [1/2] Starting Python Backend on port 8088...
    start /min cmd /c "cd /d "%~dp0backend" && python -m uvicorn app.main:app --port 8088 --reload"
) else (
    echo [1/2] Backend is already running on port 8088.
)

REM 2. Start Frontend if not already active
curl -s http://127.0.0.1:3050 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [2/2] Starting Frontend on port 3050...
    start /min cmd /c "cd /d "%~dp0frontend" && npm run dev"
) else (
    echo [2/2] Frontend is already running on port 3050.
)

REM 3. Wait until frontend is fully ready before launching browser
echo Waiting for servers to initialize...
set /a attempts=0
:wait_loop
set /a attempts+=1
timeout /t 1 /nobreak >nul
curl -s http://127.0.0.1:3050 >nul 2>&1
if %ERRORLEVEL% equ 0 goto open_app
if %attempts% geq 15 goto open_app
goto wait_loop

:open_app
echo Servers ready! Opening AURA app window...

REM Open in dedicated standalone app window
where msedge >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start msedge --app=http://localhost:3050 --window-size=1100,820
    exit /b
)

where chrome >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start chrome --app=http://localhost:3050 --window-size=1100,820
    exit /b
)

start http://localhost:3050
exit /b
