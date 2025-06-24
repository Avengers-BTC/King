@echo off
echo Starting both Socket.IO server and Next.js application...

start cmd /k "cd socket-server && node index.js"
timeout /t 3
start cmd /k "npm run dev"

echo Both servers started. Press any key to terminate both.
pause

taskkill /fi "WINDOWTITLE eq socket-server*" /f
taskkill /fi "WINDOWTITLE eq npm run dev*" /f
