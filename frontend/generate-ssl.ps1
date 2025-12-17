# Generate self-signed SSL certificate for local development
Write-Host "Generating SSL certificate..." -ForegroundColor Green

# Get local IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -like "192.168.*"}).IPAddress

if (-not $ip) {
    $ip = Read-Host "Enter your IP address (e.g., 192.168.1.100)"
}

Write-Host "Using IP: $ip" -ForegroundColor Yellow

# Create OpenSSL config file
$config = @"
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
IP.2 = $ip
"@

$config | Out-File -FilePath "openssl.cnf" -Encoding ASCII

# Generate certificate using PowerShell (no OpenSSL needed)
Write-Host "Creating certificate..." -ForegroundColor Green

$cert = New-SelfSignedCertificate `
    -DnsName "localhost", $ip `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -NotAfter (Get-Date).AddYears(1) `
    -KeyAlgorithm RSA `
    -KeyLength 2048

# Export certificate
$certPath = "localhost.pem"
$keyPath = "localhost-key.pem"

# Export as PFX first
$pfxPath = "temp.pfx"
$password = ConvertTo-SecureString -String "temp" -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password | Out-Null

# Convert PFX to PEM using certutil
certutil -dump $pfxPath > temp.txt

# Extract certificate
$certContent = Get-Content "Cert:\CurrentUser\My\$($cert.Thumbprint)" -Encoding Byte
[System.IO.File]::WriteAllBytes($certPath, $certContent)

# Export private key (requires OpenSSL or manual extraction)
Write-Host ""
Write-Host "Certificate generated!" -ForegroundColor Green
Write-Host "Files: localhost.pem, localhost-key.pem" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you have OpenSSL installed, run:" -ForegroundColor Yellow
Write-Host "openssl req -x509 -newkey rsa:2048 -keyout localhost-key.pem -out localhost.pem -days 365 -nodes -subj '/CN=localhost' -addext 'subjectAltName=DNS:localhost,IP:$ip'" -ForegroundColor White

# Cleanup
Remove-Item $pfxPath -ErrorAction SilentlyContinue
Remove-Item temp.txt -ErrorAction SilentlyContinue
Remove-Item "Cert:\CurrentUser\My\$($cert.Thumbprint)"
