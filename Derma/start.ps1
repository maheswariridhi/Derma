# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend/app; ./venv/Scripts/Activate.ps1; python -m app.main"

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" 