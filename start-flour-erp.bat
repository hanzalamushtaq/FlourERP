@echo off
TITLE FlourERP Launcher - Malik Hanzala Mushtaq & Sons
color 0A

echo ======================================================================
echo    FLOUR ERP - ATTAL CHAKKI MANAGEMENT & POS SYSTEM
echo    ملک حنظلہ مشتاق اینڈ سنز آٹا چکی مینجمنٹ سسٹم
echo ======================================================================
echo.

:: 1. Check Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js (v18 or newer) from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking Database and Schema...
cd /d "%~dp0\apps\api"
if not exist "prisma\dev.db" (
    echo [INFO] Database file not found. Initializing SQLite database...
    call npx prisma db push
    call npx tsx src/db/seed.ts
) else (
    echo [OK] SQLite database found at apps\api\prisma\dev.db
)

echo.
echo [2/4] Starting FlourERP API Backend (Port 5000)...
start "FlourERP API (Port 5000)" cmd /k "cd /d ""%~dp0\apps\api"" && npm run dev"

echo.
echo [3/4] Starting FlourERP Web Dashboard (Port 3000)...
start "FlourERP Web (Port 3000)" cmd /k "cd /d ""%~dp0\apps\web"" && npm run dev"

echo.
echo [4/4] Waiting for services to initialize...
timeout /t 4 /nobreak >nul

echo [INFO] Opening FlourERP in default browser (http://localhost:3000)...
start http://localhost:3000

echo.
echo ======================================================================
echo    FLOUR ERP IS NOW RUNNING!
echo    نظام کامیابی کے ساتھ شروع ہو چکا ہے۔
echo ======================================================================
echo    - Web Dashboard:  http://localhost:3000
echo    - API Endpoint:   http://localhost:5000/api/health
echo.
echo    To stop the application, close the two opened command windows
echo    ("FlourERP API" and "FlourERP Web").
echo ======================================================================
echo.
pause
