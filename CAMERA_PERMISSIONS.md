# Camera Permissions Setup Guide

## Browser Permissions

### Chrome/Edge (Desktop & Mobile)
1. Click the lock icon in the address bar
2. Find "Camera" in the permissions list
3. Select "Allow"
4. Refresh the page

### Firefox (Desktop & Mobile)
1. Click the lock icon in the address bar
2. Click "Connection secure" > "More information"
3. Go to "Permissions" tab
4. Find "Use the Camera" and select "Allow"
5. Refresh the page

### Safari (Desktop & Mobile)
1. Go to Safari > Settings/Preferences
2. Select "Websites" tab
3. Click "Camera" in the left sidebar
4. Find your website and select "Allow"
5. Refresh the page

## Android Permissions

### Chrome on Android
1. Open Chrome app
2. Tap the three dots menu (⋮)
3. Go to Settings > Site settings > Camera
4. Ensure camera access is enabled
5. Find your website in the list and set to "Allow"

### System-level Permissions
1. Go to Android Settings
2. Apps > Chrome (or your browser)
3. Permissions > Camera
4. Select "Allow"

### For PWA (Progressive Web App)
If installed as an app:
1. Long press the app icon
2. Tap "App info"
3. Tap "Permissions"
4. Enable "Camera"

## iOS Permissions

### Safari on iOS
1. Go to iOS Settings
2. Scroll down and tap "Safari"
3. Tap "Camera"
4. Select "Ask" or "Allow"

### For specific website
1. Go to iOS Settings
2. Scroll down and tap "Safari"
3. Tap "Settings for Websites"
4. Tap "Camera"
5. Find your website and select "Allow"

### For PWA (Home Screen App)
1. Go to iOS Settings
2. Scroll down to find the app
3. Tap on the app name
4. Enable "Camera" permission

## HTTPS Requirement

**Important**: Camera access requires HTTPS (secure connection) in production.

- Development: `http://localhost` is allowed
- Production: Must use `https://yourdomain.com`

## Troubleshooting

### Camera Not Working
1. **Check if camera is in use**: Close other apps using the camera
2. **Browser cache**: Clear browser cache and cookies
3. **Restart browser**: Close and reopen the browser
4. **Check system permissions**: Ensure OS-level camera access is granted
5. **Try incognito/private mode**: Test if extensions are blocking access

### Permission Denied Error
- Revoke and re-grant permissions in browser settings
- Check if antivirus/firewall is blocking camera access
- Ensure you're using HTTPS in production

### No Camera Found
- Check if camera is properly connected (desktop)
- Verify camera is not disabled in device manager
- Try a different browser

## Testing Camera Access

You can test camera access at:
- Chrome: `chrome://settings/content/camera`
- Firefox: `about:preferences#privacy`
- Edge: `edge://settings/content/camera`

## Code Implementation

The app now includes:
- ✅ Explicit permission request button
- ✅ Detailed error messages for different scenarios
- ✅ Retry mechanism for camera access
- ✅ Browser compatibility checks
- ✅ Mobile-optimized video constraints
- ✅ PWA manifest with camera permissions
