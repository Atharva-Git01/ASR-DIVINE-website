# ─────────────────────────────────────────────────────────────────────────────
# Cocoa & Crumb — Python Virtualenv Setup (PowerShell)
# Usage: .\setup_venv.ps1
# ─────────────────────────────────────────────────────────────────────────────

$VenvName = "asrdivine"
$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Cocoa & Crumb — Python venv setup" -ForegroundColor Cyan
Write-Host "──────────────────────────────────" -ForegroundColor Cyan

# Remove old venv if it exists (handles the Linux venv that may have been created)
if (Test-Path $VenvName) {
    Write-Host "Removing existing '$VenvName' folder..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $VenvName
    Write-Host "  Done." -ForegroundColor Green
}

# Create fresh Windows virtualenv
Write-Host "Creating virtualenv '$VenvName'..." -ForegroundColor Yellow
python -m venv $VenvName
Write-Host "  Done." -ForegroundColor Green

# Activate and install
Write-Host "Installing dependencies from requirements.txt..." -ForegroundColor Yellow
& ".\$VenvName\Scripts\pip.exe" install --upgrade pip --quiet
& ".\$VenvName\Scripts\pip.exe" install -r requirements.txt
Write-Host "  Done." -ForegroundColor Green

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To activate the venv:" -ForegroundColor Cyan
Write-Host "  PowerShell:  .\asrdivine\Scripts\Activate.ps1"
Write-Host "  CMD:         asrdivine\Scripts\activate.bat"
Write-Host "  Git Bash:    source asrdivine/Scripts/activate"
Write-Host ""
