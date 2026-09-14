$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting Predictive Bot (FastAPI + Vite React) " -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

$backendPath = Join-Path $root "backend"
$frontendPath = Join-Path $root "frontend"

# Launch Backend
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$backendPath'; python -m uvicorn app.main:app --port 8088 --reload"
Write-Host "[OK] Backend started at http://127.0.0.1:8088" -ForegroundColor Green

# Launch Frontend
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", "Set-Location -LiteralPath '$frontendPath'; npm run dev"
Write-Host "[OK] Frontend started at http://localhost:3050" -ForegroundColor Green

Write-Host ""
Write-Host "App is ready! Open http://localhost:3050 in your browser." -ForegroundColor Cyan
