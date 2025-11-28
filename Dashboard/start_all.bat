@echo off
echo ================================================
echo PES Dashboard - Starting All Services
echo ================================================
echo.

echo Starting NILM Flask API (Port 5001)...
start cmd /k "cd flask_api_nilm && python app.py"
timeout /t 3 /nobreak > nul

echo Starting PV Flask API (Port 5002)...
start cmd /k "cd flask_api_pv && python app.py"
timeout /t 3 /nobreak > nul

echo Starting RAG Chatbot API (Port 5003)...
start cmd /k "cd RAG_Chatbot && python app.py"
timeout /t 3 /nobreak > nul

echo Starting Node.js Backend (Port 3001)...
start cmd /k "cd backend && npm start"
timeout /t 5 /nobreak > nul

echo Starting React Frontend (Port 3000)...
start cmd /k "cd frontend && npm start"
timeout /t 3 /nobreak > nul

echo.
echo ================================================
echo All services are starting...
echo Please wait for all windows to fully load
echo ================================================
echo.
echo NILM API:     http://localhost:5001
echo PV API:       http://localhost:5002
echo Chatbot API:  http://localhost:5003
echo Backend:      http://localhost:3001
echo Dashboard:    http://localhost:3000
echo ================================================
pause
