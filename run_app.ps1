# Launch both Backend (FastAPI) and Frontend (Vite) concurrently
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host " Starting Predictive Bot (FastAPI + Vite React) " -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python -m uvicorn app.main:app --port 8088 --reload" -PassThru
Write-Host "[✓] Backend started at http://127.0.0.1:8088 (PID: $($backendJob.Id))" -ForegroundColor Green

$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev" -PassThru
Write-Host "[✓] Frontend started at http://localhost:3050 (PID: $($frontendJob.Id))" -ForegroundColor Green

Write-Host "`nApp is ready! Open http://localhost:3050 in your browser (or use your local IP on mobile)." -ForegroundColor Cyan
