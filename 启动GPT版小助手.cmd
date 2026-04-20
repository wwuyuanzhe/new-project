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
  echo 没有找到 Node.js。请先安装 Node.js LTS，或联系我继续帮你配置。
  pause
  exit /b 1
)

if not exist ".env" (
  echo 还没有配置 OpenAI API Key。
  echo 请先双击“设置GPT密钥.cmd”，填入你的 OpenAI API Key。
  pause
  exit /b 1
)

echo.
echo 正在启动 GPT 版家庭小助手...
echo 打开地址：http://localhost:3000
echo 这个窗口不要关闭；关闭窗口，小助手后端也会停止。
echo.
start "" "http://localhost:3000"
node server.js
pause
