# ML Mini-Project Setup Guide

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **Python**: 3.8 to 3.12 (tested on Python 3.12.7)
- **Pip**: 20.0+ (tested on pip 25.1.1)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **FFmpeg**: Required for WebM audio processing

## Installation Instructions

### 1. Python Installation
Download and install Python 3.8-3.12 from [python.org](https://python.org/downloads/)
- ✅ **Recommended**: Python 3.12.7
- ✅ Add Python to PATH during installation
- ✅ Install pip (included by default)

### 2. Verify Installation
```bash
python --version    # Should show Python 3.8+ 
pip --version      # Should show pip 20.0+
```

### 3. Install FFmpeg
**Windows (using winget):**
```bash
winget install FFmpeg
```

**Windows (using Chocolatey):**
```bash
choco install ffmpeg
```

**macOS (using Homebrew):**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update && sudo apt install ffmpeg
```

### 4. Python Environment Setup
```bash
# Clone or download the project
cd Ml-mini-project

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt
```

### 5. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Node.js dependencies
npm install

# Start backend server
npm run dev
```

### 6. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start frontend development server
npm run dev
```

## Troubleshooting

### Common Issues

**1. NumPy/Numba Compatibility Error**
```bash
pip install "numpy>=1.21.0,<2.1.0" --force-reinstall
```

**2. FFmpeg Not Found**
- Ensure FFmpeg is installed and added to PATH
- Restart terminal after installation
- Test with: `ffmpeg -version`

**3. librosa Installation Issues**
```bash
# Install audio dependencies first
pip install soundfile numba
pip install librosa
```

**4. Port Already in Use**
```bash
# Kill existing processes
# Windows:
taskkill /F /IM node.exe
# macOS/Linux:
killall node
```

### Package Versions (Tested Working)
- Python: 3.12.7
- pip: 25.1.1
- numpy: 1.26.4 (must be <2.1.0)
- librosa: 0.10.2
- scikit-learn: 1.5.2
- pandas: 2.2.3
- streamlit: 1.38.0

## Quick Start Script

Create and run this script to automate the setup:

**setup.bat (Windows):**
```batch
@echo off
echo ML Mini-Project Auto Setup
python -m venv venv
call venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
cd backend && npm install
cd ../frontend && npm install
echo Setup complete! Run start.bat to launch the application.
pause
```

**start.bat (Windows):**
```batch
@echo off
echo Starting ML Mini-Project...
start cmd /k "cd backend && npm run dev"
timeout /t 3
start cmd /k "cd frontend && npm run dev"
echo Both servers starting...
pause
```

## Default Ports
- Backend API: http://localhost:3001
- Frontend: http://localhost:3000 (or next available port)

## File Structure
```
Ml-mini-project/
├── requirements.txt         # Python dependencies
├── setup_guide.md          # This file
├── backend/
│   ├── package.json        # Node.js backend dependencies
│   ├── server.js           # Express server
│   └── uploads/            # Temporary audio files
├── frontend/
│   ├── package.json        # React frontend dependencies
│   └── src/                # React components
├── models/                 # ML model files (.pkl)
├── feature_extraction.py  # Audio feature extraction
└── data/                   # Training data
```

## Testing Installation
1. Record audio in the frontend
2. Check console for successful WebM → WAV conversion
3. Verify ML prediction results appear
4. Check `/results` page for model metrics

## Support
If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify all system requirements are met
3. Ensure all dependencies are installed correctly
4. Check console logs for specific error messages