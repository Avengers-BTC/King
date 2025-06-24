# KING CHAT SOCKET.IO SERVER TEST SUITE (PowerShell version)

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "KING CHAT SOCKET.IO SERVER TEST SUITE" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start the server
Write-Host "STEP 1: Starting Socket.IO Server..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "node" -ArgumentList "index.js" -PassThru -WindowStyle Normal
Write-Host "Server starting... Waiting 3 seconds for startup"
Start-Sleep -Seconds 3

# Step 2: Run simple test
Write-Host ""
Write-Host "STEP 2: Running Simple Connection Test..." -ForegroundColor Yellow
node simple-test.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Simple test failed!" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force
    Write-Host "Server process terminated."
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Step 3: Run chat user test
Write-Host ""
Write-Host "STEP 3: Running Chat User Test (DJ + User)..." -ForegroundColor Yellow
node test-chat-users.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Chat user test failed!" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force
    Write-Host "Server process terminated."
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Step 4: Run production test
Write-Host ""
Write-Host "STEP 4: Running Production Load Test..." -ForegroundColor Yellow
node production-test.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Production test failed!" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force
    Write-Host "Server process terminated."
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# All tests passed
Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "ALL TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "The Socket.IO server is working correctly." -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can now deploy this server to Render."
Write-Host "Refer to README.md for deployment instructions."
Write-Host ""

# Clean up
Write-Host "Stopping server process..." -ForegroundColor Yellow
Stop-Process -Id $serverProcess.Id -Force
Write-Host "Server process terminated."
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
