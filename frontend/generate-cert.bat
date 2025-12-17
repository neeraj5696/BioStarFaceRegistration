@echo off
echo Generating self-signed SSL certificate for local development...
openssl req -x509 -newkey rsa:2048 -keyout localhost-key.pem -out localhost.pem -days 365 -nodes -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:192.168.1.1,IP:192.168.1.100,IP:192.168.0.1,IP:192.168.0.100,IP:10.0.0.1,IP:127.0.0.1"
echo.
echo Certificate generated successfully!
echo Files created: localhost-key.pem and localhost.pem
pause
