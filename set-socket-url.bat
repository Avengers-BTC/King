@echo off
echo Setting NEXT_PUBLIC_SOCKET_SERVER environment variable...
set NEXT_PUBLIC_SOCKET_SERVER=http://localhost:4000
echo Environment variable set: %NEXT_PUBLIC_SOCKET_SERVER%
echo.
echo Now restart your dev server (npm run dev) for changes to take effect.
pause 