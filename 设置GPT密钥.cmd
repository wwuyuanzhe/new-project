@echo off
setlocal
cd /d "%~dp0"
echo.
echo 请输入你的 OpenAI API Key。输入时会显示在窗口里，请确认旁边没人看见。
echo 这个密钥只会保存在本机 .env 文件里，不会上传到 GitHub。
echo.
set /p OPENAI_KEY=OpenAI API Key: 
if "%OPENAI_KEY%"=="" (
  echo 没有输入密钥，已取消。
  pause
  exit /b 1
)
(
  echo OPENAI_API_KEY=%OPENAI_KEY%
  echo OPENAI_MODEL=gpt-4o-mini
  echo PORT=3000
) > ".env"
echo.
echo 已保存 GPT 密钥。现在可以双击“启动GPT版小助手.cmd”。
pause
