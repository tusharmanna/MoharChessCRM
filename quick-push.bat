@echo off
REM Quick push without prompts
REM Usage: quick-push "your commit message"

if "%1"=="" (
    set message=Fix database persistence and add Render troubleshooting guide
) else (
    set message=%*
)

echo Pushing to Git...
echo Commit message: %message%
echo.

git add -A
git commit -m "%message%"
git push

if errorlevel 1 (
    echo.
    echo ERROR: Failed to push changes
    pause
) else (
    echo.
    echo SUCCESS! Changes pushed to Git
    git log -1 --oneline
)

pause
