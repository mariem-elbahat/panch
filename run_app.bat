@echo off
echo ==========================================================
echo  TRUSETT - Trust Meets Settlement (Hedera Protocol MVP)
echo ==========================================================

cd /d "%~dp0"

echo [1/2] Starting TRUSETT Backend (FastAPI) on port 8000...
start "TRUSETT Backend" cmd /k "uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting TRUSETT Frontend (Vite React) on port 5173...
start "TRUSETT Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo TRUSETT is running!
echo • Frontend UI:  http://localhost:5173
echo • Backend Docs: http://127.0.0.1:8000/docs
echo.
pause
