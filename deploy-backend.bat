@echo off
echo ========================================
echo BioStarFaceRegistration - Backend PM2 Setup
echo ========================================
echo.

REM Change to the backend directory (relative to this .bat file)
cd /d "%~dp0backend"

echo [1/4] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

echo.
echo [2/4] Installing project dependencies...
if exist package-lock.json (
    echo Running: npm ci
    call npm ci
) else (
    echo Running: npm install
    call npm install
)

echo.
echo [3/4] Installing PM2 and Windows startup helper...
call npm install -g pm2@latest
call npm install -g pm2-windows-startup

echo.
echo [4/4] Starting backend with PM2...
REM You can change the name "biostar-backend" if you want
call pm2 start server-mkcert.js --name "biostar-backend-https" --watch
call pm2 save

echo.
echo Setting up Windows startup...
call pm2-startup install

echo.
echo Verifying PM2 processes...
call pm2 list

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo Status: Backend running under PM2
echo Auto-start: Enabled on Windows boot
echo.
echo Useful Commands:
echo   pm2 status          - Check app status
echo   pm2 logs biostar-backend-https  - View logs
echo   pm2 restart biostar-backend-https - Restart app
echo   pm2 stop biostar-backend-https    - Stop app
echo ========================================
pause
