@echo off
echo Installing FFmpeg for WebM audio processing...
echo.

echo Checking if Chocolatey is installed...
choco --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Chocolatey found. Installing FFmpeg via Chocolatey...
    choco install ffmpeg -y
) else (
    echo Chocolatey not found. Please install FFmpeg manually:
    echo.
    echo Option 1: Install via Chocolatey
    echo   1. Install Chocolatey from https://chocolatey.org/install
    echo   2. Run: choco install ffmpeg
    echo.
    echo Option 2: Manual installation
    echo   1. Download FFmpeg from https://ffmpeg.org/download.html
    echo   2. Extract to C:\ffmpeg
    echo   3. Add C:\ffmpeg\bin to your PATH environment variable
    echo.
    echo Option 3: Use this PowerShell command:
    echo   winget install FFmpeg
    echo.
    pause
    exit /b 1
)

echo.
echo Testing FFmpeg installation...
ffmpeg -version
if %errorlevel% equ 0 (
    echo FFmpeg installed successfully!
    echo You can now process WebM audio files.
) else (
    echo FFmpeg installation failed. Please install manually.
    echo See instructions above.
)

pause