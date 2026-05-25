@echo off

start "" "%~dp0SchemaView.API.exe"

powershell -Command ^
"while (-not (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue)) { Start-Sleep -Milliseconds 50 }"

start "" "http://localhost:5000"
