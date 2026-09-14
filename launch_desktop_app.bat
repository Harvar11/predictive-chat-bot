@echo off
title CLAIRVOYANT Predictive AI - Desktop App Launcher
cd /d "%~dp0"

echo ========================================================
echo   Launching CLAIRVOYANT Predictive AI...
echo ========================================================

REM 1. Start Python backend if not already active
curl -s http://127.0.0.1:8088/api/health >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [1/2] Starting Python Backend on port 8088...
    start "CLAIRVOYANT Backend" /min cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8088 --reload"
) else (
    echo [1/2] Backend is already running on port 8088.
)

REM 2. Start Frontend if not already active
curl -s http://127.0.0.1:3050 >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [2/2] Starting Frontend on port 3050...
    start "CLAIRVOYANT Frontend" /min cmd /k "cd /d "%~dp0frontend" && npm run dev"
) else (
    echo [2/2] Frontend is already running on port 3050.
)

REM 3. Wait until frontend is ready (using ping for 100% reliable delay)
echo Waiting for servers to initialize...
set /a attempts=0
:wait_loop
set /a attempts+=1
ping -n 2 127.0.0.1 >nul
curl -s http://127.0.0.1:3050 >nul 2>&1
if %ERRORLEVEL% equ 0 goto open_app
if %attempts% geq 20 goto open_app
goto wait_loop

:open_app
echo Servers are ready! Opening CLAIRVOYANT app window...

REM Open in dedicated standalone app window using 127.0.0.1 to avoid IPv6 localhost timeouts
where msedge >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start msedge --app=http://127.0.0.1:3050 --window-size=1100,820
    exit /b
)

where chrome >nul 2>&1
if %ERRORLEVEL% equ 0 (
    start chrome --app=http://127.0.0.1:3050 --window-size=1100,820
    exit /b
)

start http://127.0.0.1:3050
exit /b
