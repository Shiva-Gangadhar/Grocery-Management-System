# Start both frontend and backend servers
Write-Host "Starting Kirana Management System..."

# Start the backend server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend; npm run server"

# Start the frontend server in a new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Frontend; npm start"

Write-Host "Servers started. Check the new windows for output." 