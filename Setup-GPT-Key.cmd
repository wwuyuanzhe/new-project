@echo off
setlocal
cd /d "%~dp0"
echo.
echo Paste your OpenAI API Key below.
echo The key will be saved only on this computer in the .env file.
echo It will NOT be uploaded to GitHub.
echo.
set /p OPENAI_KEY=OpenAI API Key: 
if "%OPENAI_KEY%"=="" (
  echo No API key entered. Canceled.
  pause
  exit /b 1
)
(
  echo OPENAI_API_KEY=%OPENAI_KEY%
  echo OPENAI_MODEL=gpt-4o-mini
  echo PORT=3000
) > ".env"
echo.
echo Done. Now double-click Start-GPT-Helper.cmd
pause
