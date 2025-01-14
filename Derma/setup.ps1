# Activate virtual environment
./backend/venv/Scripts/Activate.ps1

# Set Python path
$env:PYTHONPATH = "backend/app"

# Change to correct directory
Set-Location backend/app

Write-Host "Environment activated and paths set!" 