# Camera Access Fix for IP Address

## Problem
Camera works on `localhost:5173` but blocked on `192.168.x.x:5173` because browsers require HTTPS for camera access on non-localhost domains.

## QUICK FIX (Chrome/Edge)

### Step 1: Enable Insecure Origins Flag
1. Open Chrome and paste: `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. In the text field, add your IP address: `http://YOUR_IP:5173` (e.g., `http://192.168.1.100:5173`)
3. Set dropdown to **Enabled**
4. Click **Relaunch** button
5. Access `http://YOUR_IP:5173` - camera will work!

---

## HTTPS Solution (Requires OpenSSL)

### Step 1: Install OpenSSL
- Download: https://slproweb.com/products/Win32OpenSSL.html
- Or use Git Bash (comes with Git for Windows)

### Step 2: Generate SSL Certificate
```bash
cd frontend
openssl req -x509 -newkey rsa:2048 -keyout localhost-key.pem -out localhost.pem -days 365 -nodes -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:YOUR_IP"
```

### Step 3: Restart Server
```bash
npm run dev
```
Access: `https://YOUR_IP:5173` (accept security warning)

---

## Production Solution

For production deployment, use:
- Valid SSL certificate (Let's Encrypt)
- Nginx with HTTPS
- Domain name with SSL
