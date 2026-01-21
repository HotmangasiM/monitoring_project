@echo off
echo Starting backend ...
start cmd /k "node app.js"

timeout /t 3

echo Starting Cloudflare Tunnel...
start cmd /k "C:\cloudflared\cloudflared.exe tunnel --url http://localhost:3000 --protocol http2"