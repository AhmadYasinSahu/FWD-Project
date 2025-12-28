@echo off
echo Installing backend dependencies...
npm install

echo.
echo Creating .env file from template...
if not exist .env (
    copy env.example .env
    echo Please edit the .env file with your configuration before starting the server.
    echo.
    pause
)

echo.
echo Starting the backend server...
npm run dev
