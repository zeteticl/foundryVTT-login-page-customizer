@echo off
setlocal
set SCRIPT_DIR=%~dp0
node "%SCRIPT_DIR%fvtt-login-patcher.mjs" %*
endlocal
