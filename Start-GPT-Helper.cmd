@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
  )
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Please install Node.js LTS first.
  pause
  exit /b 1
)

if not exist ".env" (
  echo OpenAI API Key is not configured yet.
  echo Please double-click Setup-GPT-Key.cmd first.
  pause
  exit /b 1
)

echo.
echo Starting the GPT family helper...
echo Open address: http://localhost:3000
echo Keep this window open while using the helper.
echo.
start "" "http://localhost:3000"
node server.js
pause
