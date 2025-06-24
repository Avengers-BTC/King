// Test HTTP endpoint for Socket.IO server
const https = require('https');
const http = require('http');

// Get the socket server URL from command line argument or use default
const serverUrl = process.argv[2] || 'http://localhost:3001';
console.log(`[Test] Checking health endpoint at: ${serverUrl}/health`);

// Determine if we need http or https
const client = serverUrl.startsWith('https') ? https : http;

// Function to make the request
function checkHealth(url) {
  const fullUrl = `${url}${url.endsWith('/') ? 'health' : '/health'}`;
  
  client.get(fullUrl, (res) => {
    const { statusCode } = res;
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (statusCode === 200) {
        console.log('[Test] ✅ Health endpoint is working!');
        console.log('[Test] Status code:', statusCode);
        try {
          const parsed = JSON.parse(data);
          console.log('[Test] Response:', parsed);
        } catch (e) {
          console.log('[Test] Response (raw):', data);
        }
        process.exit(0);
      } else {
        console.error('[Test] ❌ Health endpoint returned non-200 status code:', statusCode);
        console.log('[Test] Response:', data);
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error('[Test] ❌ Error checking health endpoint:', err.message);
    process.exit(1);
  });
}

// Check both with and without trailing slash
checkHealth(serverUrl);
