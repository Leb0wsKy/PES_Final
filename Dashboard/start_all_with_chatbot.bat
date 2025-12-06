@echo off
echo ============================================================
echo Starting PowerPulse Dashboard with RAG Chatbot
echo ============================================================
echo.

echo Starting NILM Flask API (Port 5001)...
start "NILM API" cmd /k "cd flask_api_nilm && python app.py"
timeout /t 3 /nobreak >nul

echo Starting PV Flask API (Port 5002)...
start "PV API" cmd /k "cd flask_api_pv && python app.py"
timeout /t 3 /nobreak >nul

echo Starting RAG Chatbot API (Port 5003)...
start "Chatbot API" cmd /k "cd RAG_Chatbot && python app.py"
timeout /t 5 /nobreak >nul

echo Starting Node.js Backend (Port 3001)...
start "Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul

echo Starting React Frontend (Port 3000)...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ============================================================
echo All services started!
echo ============================================================
echo NILM API:     http://localhost:5001
echo PV API:       http://localhost:5002
echo Chatbot API:  http://localhost:5003
echo Backend:      http://localhost:3001
echo Frontend:     http://localhost:3000
echo ============================================================
echo.
echo Press any key to stop all services...
pause >nul

taskkill /FI "WindowTitle eq NILM API*" /T /F
taskkill /FI "WindowTitle eq PV API*" /T /F
taskkill /FI "WindowTitle eq Chatbot API*" /T /F
taskkill /FI "WindowTitle eq Backend*" /T /F
taskkill /FI "WindowTitle eq Frontend*" /T /F

echo All services stopped.
pause
