@echo off
REM Push changes to Git repository
REM This script stages, commits, and pushes all changes

echo.
echo ======================================
echo Pushing changes to Git repository
echo ======================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    pause
    exit /b 1
)

REM Show current status
echo Checking git status...
echo.
git status
echo.

REM Ask for confirmation
set /p confirm="Do you want to continue? (y/n): "
if /i not "%confirm%"=="y" (
    echo Cancelled
    exit /b 0
)

echo.
echo ======================================
echo Staging changes...
echo ======================================

REM Stage all changes
git add -A
if errorlevel 1 (
    echo ERROR: Failed to stage changes
    pause
    exit /b 1
)

echo Changes staged successfully
echo.

REM Show what will be committed
echo Staged files:
git diff --cached --name-only
echo.

REM Ask for commit message
echo.
set /p message="Enter commit message (or press Enter for default): "

if "%message%"=="" (
    set message=Fix database persistence and add Render troubleshooting guide
)

echo.
echo ======================================
echo Committing changes...
echo ======================================
echo Commit message: %message%
echo.

REM Create commit
git commit -m "%message%"
if errorlevel 1 (
    echo ERROR: Failed to create commit
    pause
    exit /b 1
)

echo Commit created successfully
echo.

REM Show current branch
echo ======================================
echo Getting current branch...
echo ======================================
for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set branch=%%i
echo Current branch: %branch%
echo.

REM Push changes
echo ======================================
echo Pushing to remote (%branch%)...
echo ======================================
echo.

git push origin %branch%
if errorlevel 1 (
    echo ERROR: Failed to push to remote
    echo Make sure you have:
    echo - Internet connection
    echo - Push permissions to the repository
    echo - SSH keys configured (if using SSH)
    pause
    exit /b 1
)

echo.
echo ======================================
echo SUCCESS! Changes pushed to Git
echo ======================================
echo.
echo Branch: %branch%
echo.

REM Show latest commit
echo Latest commit:
git log -1 --oneline
echo.

REM Ask if user wants to open GitHub
set /p opengh="Open GitHub in browser? (y/n): "
if /i "%opengh%"=="y" (
    start https://github.com
)

pause
