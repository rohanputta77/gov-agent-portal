@echo off
echo ================================================
echo  Bureaucracy Management Agent - Demo Startup
echo ================================================
echo.

echo [1/2] Starting Backend API (FastAPI + SQLite)...
start "Backend API" cmd /k "cd /d d:\DOWNLOADS\Orion2\backend && .\venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo [2/2] Starting Frontend (React + Vite)...
start "Frontend" cmd /k "cd /d d:\DOWNLOADS\Orion2\frontend && npm.cmd run dev"

echo.
echo ================================================
echo  Both servers starting...
echo  Backend:  http://localhost:8000
echo  API Docs: http://localhost:8000/docs
echo  Frontend: http://localhost:5173
echo ================================================
pause
