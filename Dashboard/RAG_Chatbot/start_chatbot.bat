@echo off
echo ====================================
echo Starting RAG Chatbot Flask API
echo ====================================
echo.
echo [1/3] Checking Python...
python --version
echo.

echo [2/3] Installing dependencies...
pip install -q -r requirements.txt
echo Dependencies installed.
echo.

echo [3/3] Starting Flask server on port 5003...
echo Building RAG index (this may take 1-2 minutes)...
echo.
python app.py

pause
