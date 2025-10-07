@echo off
echo ================================
echo    ML Mini-Project Auto Setup
echo ================================
echo.

echo [1/6] Checking Python installation...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.8-3.12 from python.org
    pause
    exit /b 1
)

echo [2/6] Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [3/6] Activating virtual environment...
call venv\Scripts\activate

echo [4/6] Upgrading pip...
python -m pip install --upgrade pip

echo [5/6] Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo [6/6] Installing Node.js dependencies...
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)

cd ..\frontend
echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ================================
echo    Setup Complete! ✅
echo ================================
echo.
echo Next steps:
echo 1. Run start.bat to launch the application
echo 2. Or manually start:
echo    - Backend: cd backend ^&^& npm run dev
echo    - Frontend: cd frontend ^&^& npm run dev
echo.
echo The application will be available at:
echo - Backend API: http://localhost:3001
echo - Frontend: http://localhost:3000
echo.
pause