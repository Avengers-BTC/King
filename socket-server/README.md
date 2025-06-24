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

The server will run on port 3001 by default, or you can set a different port using the `PORT` environment variable.

## Deployment

### Railway Deployment

1. Create a Railway account at https://railway.app/
2. Install Railway CLI: `npm i -g @railway/cli`
3. Login: `railway login`
4. Initialize project: `railway init`
5. Deploy: `railway up`

### Render Deployment

1. Create a Render account at https://render.com/
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure as:
   - Name: king-socket-server
   - Build Command: `npm install`
   - Start Command: `npm start`

## Environment Variables

- `PORT`: The port to run the server on (defaults to 3001)
- `NEXT_PUBLIC_APP_URL`: The URL of your main Next.js application for CORS

## Main App Configuration

In your Next.js app, set the following environment variables:

```
NEXT_PUBLIC_SOCKET_SERVER=https://your-deployed-socket-server-url
```
