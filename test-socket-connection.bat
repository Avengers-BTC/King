@echo off
echo Checking Socket.IO server status...

curl -s http://localhost:3001 || echo Socket.IO server is not running!

echo.
echo Attempting to connect using test client...
cd socket-server
node test-client.js
