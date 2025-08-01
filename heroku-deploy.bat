@echo off
echo ========================================
echo    KOST MEWAH PATEMON - HEROKU DEPLOY
echo ========================================
echo.

echo [1/7] Checking Heroku CLI...
heroku --version
if %errorlevel% neq 0 (
    echo ERROR: Heroku CLI not installed!
    echo Please install from: https://devcenter.heroku.com/articles/heroku-cli
    pause
    exit /b 1
)

echo [2/7] Login to Heroku...
heroku login

echo [3/7] Creating Heroku app...
set /p APP_NAME="Enter your app name (kost-mewah-patemon-yourname): "
if "%APP_NAME%"=="" (
    heroku create kost-mewah-patemon-%random%
) else (
    heroku create %APP_NAME%
)

echo [4/7] Adding JawsDB MySQL addon (Free tier)...
heroku addons:create jawsdb:kitefin
echo Waiting for database to be ready...
timeout /t 15

echo [5/7] Getting database connection info...
heroku config:get JAWSDB_URL

echo [6/7] Setting up environment variables...
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=kost-mewah-patemon-super-secret-jwt-key-production-2025

echo [7/7] Deploying to Heroku...
git add .
git commit -m "Deploy to Heroku with MySQL database"
git push heroku main

echo.
echo ========================================
echo       DEPLOYMENT COMPLETED! 
echo ========================================
echo.
echo Your app is now live! Opening in browser...
heroku open

echo.
echo Useful commands:
echo - View logs: heroku logs --tail
echo - Restart app: heroku restart
echo - Open dashboard: heroku dashboard
echo - Database info: heroku config:get JAWSDB_URL
echo.
pause
