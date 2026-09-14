$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting Predictive Bot (FastAPI + Vite React) " -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"

# Launch Backend
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$backendPath'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8088 --reload"
Write-Host "[OK] Backend started on 0.0.0.0:8088 (Local & Mobile LAN)" -ForegroundColor Green

# Launch Frontend
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$frontendPath'; npm run dev"
Write-Host "[OK] Frontend started on port 3050" -ForegroundColor Green

Write-Host ""
Write-Host "Desktop URL:  http://localhost:3050" -ForegroundColor Cyan
Write-Host "Mobile Wi-Fi: http://192.168.1.6:3050" -ForegroundColor Yellow

