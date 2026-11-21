@echo off
echo ===================================================
echo Starting TripStock AI FastAPI Backend Server...
echo ===================================================
cd /d "%~dp0backend"
"C:\ProgramData\anaconda3\python.exe" run.py
pause
