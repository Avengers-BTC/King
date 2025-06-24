# King Chat Socket.IO Server

This is the standalone Socket.IO server for the King chat application.

## Setup

1. Install dependencies:
```
npm install
```

2. Start the server:
```
npm start
```
or
```
node index.js
```
or use the batch file:
```
.\start-server.bat
```

The server will run on port 3001 by default, or you can set a different port using the `PORT` environment variable.

## Testing

### Basic Testing
You can test the connection using the included test client:
```
node test-client.js
```
or
```
.\run-test.bat
```

### Advanced Testing
For more advanced tests that simulate both a DJ and a regular user interacting:
```
node test-chat-users.js
```
or
```
.\run-chat-test.bat
```

### Simple Test
For a simplified test that checks server status before connecting:
```
node simple-test.js
```

## Troubleshooting

1. **Connection Issues**: If clients can't connect, check:
   - CORS settings in the server
   - Network/firewall settings
   - Client socket.io version compatibility

2. **Message Delivery Problems**: 
   - Check room IDs are consistent
   - Verify all events are being emitted correctly
   - Look for client-side errors in browser console

3. **Deployment Issues**:
   - Ensure the server is running and accessible
   - Check environment variables are set correctly
   - Verify the socket path is correctly configured

## Deployment

### Render Deployment

1. Create a Render account at https://render.com/
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure as:
   - Name: king-socket-server
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node index.js`
   - Auto-deploy: Enable

5. Environment variables to set in Render:
   - `PORT`: 10000 (Render assigns ports dynamically, but you need to specify one)
   - `NODE_ENV`: production
   - `CORS_ORIGIN`: Your frontend URL (e.g., https://your-app.vercel.app)

6. Health Check URL: Set to `/` to use the built-in health check endpoint

7. **Important**: For Render's free tier, the service will spin down after inactivity. The first connection after idle time may time out. The code includes retry logic to handle this.

8. After deploying, update your frontend's socket connection URL to point to your Render service URL.

## Environment Variables

- `PORT`: The port to run the server on (defaults to 3001)
- `CORS_ORIGIN`: The URL of your main Next.js application for CORS (defaults to *)
- `NODE_ENV`: Set to 'production' in production environments

## Main App Configuration

In your Next.js app, update the socket-context.tsx file to use the correct Socket.IO server URL:

```typescript
// For production
const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'https://your-render-service.onrender.com';

// For local development
const socketUrl = 'http://localhost:3001';
```
