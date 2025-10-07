@echo off
echo Installing ML Audio Dashboard Frontend...
echo.

cd /d "%~dp0"

echo Installing dependencies...
npm install

echo.
echo Project setup complete!
echo.
echo To start the development server:
echo cd "%~dp0"
echo npm run dev
echo.
echo The application will be available at http://localhost:3000

pause