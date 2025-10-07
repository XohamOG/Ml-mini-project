@echo off
echo Fixing NumPy version compatibility for Numba/Librosa...
echo.

echo Installing compatible NumPy version...
pip install "numpy>=1.21.0,<2.1.0" --force-reinstall

echo.
echo Installing other required packages...
pip install -r requirements.txt

echo.
echo Done! Python dependencies should now be compatible.
echo You can now start the backend server with: npm start
pause