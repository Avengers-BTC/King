@echo off
echo ======================================================
echo KING CHAT SOCKET.IO SERVER TEST SUITE
echo ======================================================
echo.

echo STEP 1: Starting Socket.IO Server...
start cmd /k "node index.js"
echo Server starting... Waiting 3 seconds for startup
timeout /t 3 /nobreak > nul

echo.
echo STEP 2: Running Simple Connection Test...
node simple-test.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Simple test failed!
    goto ERROR
)

echo.
echo STEP 3: Running Chat User Test (DJ + User)...
node test-chat-users.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Chat user test failed!
    goto ERROR
)

echo.
echo STEP 4: Running Production Load Test...
node production-test.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Production test failed!
    goto ERROR
)

echo.
echo ======================================================
echo ALL TESTS PASSED SUCCESSFULLY!
echo The Socket.IO server is working correctly.
echo ======================================================
echo.
echo You can now deploy this server to Render.
echo Refer to README.md for deployment instructions.
echo.
goto END

:ERROR
echo.
echo ======================================================
echo TEST SUITE FAILED
echo ======================================================
echo.
echo Please fix the issues and run the tests again.
echo.

:END
echo Press any key to exit...
pause > nul
