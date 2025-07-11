@echo off
echo Copying email settings to .env file...

if exist .env (
  echo.
  echo Email settings will be appended to your existing .env file.
  echo A backup of your current .env file will be created as .env.bak
  echo.
  copy .env .env.bak >nul
) else (
  echo Creating new .env file...
)

type .env.email >> .env

echo.
echo Email settings have been added to your .env file.
echo Please edit the .env file to update with your actual email credentials.
echo.
echo Press any key to open the .env file for editing...
pause >nul
start notepad .env
