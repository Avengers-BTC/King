Write-Host "Starting Socket.IO Chat Test with DJ and Regular User" -ForegroundColor Cyan

# Check if server is running first
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 2
    Write-Host "Socket.IO server is running" -ForegroundColor Green
}
catch {
    Write-Host "Socket.IO server is not running or not responding!" -ForegroundColor Red
    Write-Host "Starting server..." -ForegroundColor Yellow
    
    # Start the server in a new window
    Start-Process powershell -ArgumentList "-Command `"cd '$PSScriptRoot'; node index.js`""
    
    # Wait for server to start
    Write-Host "Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# Run the chat users test
Write-Host "Running chat test with DJ and regular user..." -ForegroundColor Cyan
node "$PSScriptRoot\test-chat-users.js"

# Pause at the end
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
