# HTTPS Setup for Camera Access

## Option 1: Using mkcert (EASIEST - Recommended)

### Install mkcert
```powershell
# Using Chocolatey
choco install mkcert

# Or download from: https://github.com/FiloSottile/mkcert/releases
```

### Generate Certificates
```bash
cd frontend

# Install local CA
mkcert -install

# Generate certificate for localhost and your IP
mkcert localhost 192.168.1.100 127.0.0.1

# Rename files
move localhost+2.pem localhost.pem
move localhost+2-key.pem localhost-key.pem
```

### Start Server
```bash
npm run dev
```

Access: `https://192.168.1.100:5173` ✅

---

## Option 2: Using OpenSSL

### Install OpenSSL
- Download: https://slproweb.com/products/Win32OpenSSL.html
- Or use Git Bash

### Generate Certificate
```bash
cd frontend
openssl req -x509 -newkey rsa:2048 -keyout localhost-key.pem -out localhost.pem -days 365 -nodes -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:192.168.1.100"
```

Replace `192.168.1.100` with your IP address.

### Start Server
```bash
npm run dev
```

Access: `https://192.168.1.100:5173` (accept security warning)

---

## Option 3: Chrome Flag (Quick Test)

1. Open: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. Add: `http://192.168.1.100:5173`
3. Enable and relaunch
4. Access: `http://192.168.1.100:5173` ✅

---

## How It Works

The `vite.config.ts` automatically detects if `localhost.pem` and `localhost-key.pem` exist:
- **Found**: Runs with HTTPS
- **Not found**: Runs with HTTP (use Chrome flag)
