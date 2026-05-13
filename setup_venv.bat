@echo off
:: ─────────────────────────────────────────────────────────────────────────────
:: Cocoa & Crumb — Python Virtualenv Setup (CMD)
:: Usage: setup_venv.bat
:: ─────────────────────────────────────────────────────────────────────────────

set VENV=asrdivine

echo.
echo Cocoa ^& Crumb — Python venv setup
echo ────────────────────────────────────

:: Remove old venv if present
if exist %VENV% (
    echo Removing existing '%VENV%' folder...
    rmdir /S /Q %VENV%
    echo   Done.
)

:: Create fresh venv
echo Creating virtualenv '%VENV%'...
python -m venv %VENV%
echo   Done.

:: Install dependencies
echo Installing dependencies...
%VENV%\Scripts\pip.exe install --upgrade pip --quiet
%VENV%\Scripts\pip.exe install -r requirements.txt
echo   Done.

echo.
echo Setup complete!
echo.
echo To activate:   asrdivine\Scripts\activate
echo.
pause
