@echo off
echo Installing Backend Dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo Installing NILM API Dependencies...
cd flask_api_nilm
call pip install -r requirements.txt
cd ..

echo.
echo Installing PV API Dependencies...
cd flask_api_pv
call pip install -r requirements.txt
cd ..

echo.
echo ================================================
echo Installation Complete!
echo ================================================
echo.
echo To start the dashboard, run: start_all.bat
pause
