# TRUSETT - Application Launcher (PowerShell)
# Launches both the FastAPI backend and Vite React frontend in parallel

Write-Host "==========================================================" -ForegroundColor DarkGreen
Write-Host " TRUSETT — Trust Meets Settlement (Hedera Protocol MVP) " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor DarkGreen

$panchDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend Server
Write-Host "`n[1/2] Starting TRUSETT FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Cyan
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$panchDir'; uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

# Start Frontend Dev Server
Write-Host "[2/2] Starting TRUSETT React Frontend on http://localhost:5173..." -ForegroundColor Cyan
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$panchDir\frontend'; npm run dev" -PassThru

Write-Host "`nAll services launched successfully!" -ForegroundColor Green
Write-Host "• Frontend Web UI: http://localhost:5173" -ForegroundColor White
Write-Host "• Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "• HashScan Explorer: https://hashscan.io/testnet" -ForegroundColor White
Write-Host "`nPress Ctrl+C or close the spawn windows to stop." -ForegroundColor Gray
