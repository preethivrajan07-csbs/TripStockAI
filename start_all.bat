@echo off
echo =========================================================================
echo Launching TripStock AI - Intelligent Travel Inventory & Budget Platform
echo =========================================================================
start "TripStock AI Backend (FastAPI)" cmd /c "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "TripStock AI Frontend (React Vite)" cmd /c "%~dp0start_frontend.bat"
echo.
echo TripStock AI is now launching!
echo Backend API: http://127.0.0.1:8000
echo Frontend UI: http://localhost:5173
echo.
pause
