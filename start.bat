@echo off
echo ================================
echo   Starting ML Mini-Project
echo ================================
echo.

echo Checking if setup is complete...
if not exist "venv\" (
    echo ERROR: Virtual environment not found. Please run setup.bat first.
    pause
    exit /b 1
)

if not exist "backend\node_modules\" (
    echo ERROR: Backend dependencies not found. Please run setup.bat first.
    pause
    exit /b 1
)

if not exist "frontend\node_modules\" (
    echo ERROR: Frontend dependencies not found. Please run setup.bat first.
    pause
    exit /b 1
)

echo [1/2] Starting backend server...
start "ML Backend Server" cmd /k "cd /d %~dp0backend && npm run dev"

echo [2/2] Waiting 3 seconds then starting frontend...
timeout /t 3 /nobreak >nul

start "ML Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ================================
echo   Servers Starting... 🚀
echo ================================
echo.
echo Backend API: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Both servers are starting in separate windows.
echo Close this window when done.
echo.
pause