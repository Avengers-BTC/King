# Testing PWA in Development Environment

Follow these steps to test your PWA functionality locally:

## Basic Testing

1. Run the development server: `npm run dev`
2. Open Chrome or Edge browser and navigate to http://localhost:3000
3. To verify the PWA is working properly, check the following:

## Chrome/Edge DevTools Testing

1. Open DevTools (F12 or right-click and select "Inspect")
2. Go to the "Application" tab
3. In the sidebar, check these sections:
   - **Manifest**: Should show your app's icon, name, and other details
   - **Service Workers**: Should show your active service worker
   - **Cache Storage**: Should show cached resources after you navigate the app

## Enable PWA Installation in Development

1. In Chrome DevTools:
   - Go to Application → Service Workers
   - Check "Update on reload" to get fresh service worker code
   - Check "Bypass for network" for easier debugging

2. To trigger the install prompt manually:
   - In DevTools Console, type: `window.deferredPrompt.prompt()` (if you've navigated enough)
   - Or simply reload the page and use your custom install button

## Testing Offline Functionality

1. In Chrome DevTools:
   - Go to Network tab
   - Check "Offline" checkbox
   - Reload the page - your cached content should still appear

## Testing on Mobile Devices (Local Network)

If you want to test on real mobile devices without deploying:

1. Find your computer's local IP address:
   - Open Command Prompt and type `ipconfig`
   - Look for IPv4 Address (something like 192.168.x.x)

2. Modify your Next.js start command:
   ```
   npm run dev -- -H 0.0.0.0
   ```

3. On your mobile device:
   - Connect to the same WiFi network as your computer
   - Open browser and navigate to http://[YOUR_IP_ADDRESS]:3000
   - You can now test PWA features including installation

Note: For complete PWA testing, including automatic install prompts, you may still need to test on a production deployment.
