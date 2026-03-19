@echo off
echo ========================================
echo    Starting Farmer Platform...
echo ========================================
echo.

echo [1/3] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d d:\KAVIN\web\server && npm run dev"
timeout /t 2 /nobreak >nul

echo [2/3] Starting Web Frontend (Port 5173)...
start "Web App" cmd /k "cd /d d:\KAVIN\web\client && npm run dev"
timeout /t 2 /nobreak >nul

echo [3/3] Starting Mobile App (Flutter Chrome)...
start "Mobile App" cmd /k "cd /d d:\KAVIN\mobile && flutter run -d chrome"

echo.
echo ========================================
echo All 3 apps are starting!
echo  - Backend:    http://localhost:5000
echo  - Web App:    http://localhost:5173
echo  - Mobile App: Opens in Chrome
echo ========================================
pause
