@echo off
REM Diagnostic script for Render deployment issues

echo.
echo ======================================
echo Render Deployment Diagnostics
echo ======================================
echo.

REM Check if Render CLI is installed
echo Checking for Render CLI...
render --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Render CLI not installed
    echo.
    echo Install with: npm install -g @render-oss/render-cli
    echo Then run: render login
    pause
    exit /b 1
)

echo Render CLI found
echo.

REM Check if logged in
echo Attempting to list services...
for /f "tokens=*" %%i in ('render services 2^>^&1') do (
    if "%%i" neq "" (
        echo %%i
    )
)

echo.
echo ======================================
echo Checking database file on Render...
echo ======================================
echo.

REM Try to download the database
echo Downloading crm.db from Render...
render download --service moharchesscrm --path /app/crm-app/backend/crm.db 2>&1

if exist "crm.db" (
    echo.
    echo SUCCESS: Database file downloaded
    echo.
    for /f %%A in ('wc -c "crm.db"') do (
        echo File size: %%A bytes
    )
    echo.
    echo Backing up as crm.db.render-backup
    copy crm.db crm.db.render-backup
) else (
    echo.
    echo ERROR: Database file not found on Render
    echo This means:
    echo 1. Persistent disk not configured, OR
    echo 2. crm.db file not on persistent disk
    echo.
    echo Solution:
    echo 1. Check Render dashboard for persistent disk configuration
    echo 2. Mount path should be: /app
    echo 3. If missing, add new disk with mount path /app
    echo 4. Then upload your local database file
)

echo.
echo ======================================
echo Testing API endpoint...
echo ======================================
echo.

REM Test the API
echo Testing: https://moharchesscrm.onrender.com/api/students
curl -s https://moharchesscrm.onrender.com/api/students

echo.
echo.
echo ======================================
echo Diagnostics complete
echo ======================================
echo.

pause
