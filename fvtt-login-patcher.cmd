@echo off
setlocal
set ROOT=%~dp0
node "%ROOT%src\fvtt-login-patcher.mjs" %*
endlocal
