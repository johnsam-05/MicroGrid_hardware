@echo off
title MicroGrid Launcher
echo Starting MicroGrid Project...
echo.

:: Start Server
echo Starting server...
start "Server" cmd /k "cd /d E:\Works\Projects\MicroGrid_hardware\server && npm start"

:: Start Client
echo Starting client...
start "Client" cmd /k "cd /d E:\Works\Projects\MicroGrid_hardware\client && npm start"

:: Start Hardware (Python)
echo Starting hardware module...
start "Hardware" cmd /k "cd /d E:\Works\Projects\MicroGrid_hardware\Hardware && python sample.py"

echo.
echo All components launched successfully!
echo.
echo Press any key here to stop all processes...
pause >nul

echo Stopping all processes...

:: Kill node (for client & server)
taskkill /F /IM node.exe >nul 2>&1

:: Kill python (for hardware)
taskkill /F /IM python.exe >nul 2>&1

echo All processes stopped.
pause
exit
