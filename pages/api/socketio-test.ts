import type { NextApiRequest, NextApiResponse } from 'next';

// A simple test endpoint to check Socket.io configuration
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Return server configuration details
  res.status(200).json({
    status: 'ok',
    socketIoEndpoint: '/api/socketio',
    transports: ['polling'],
    supported: true,
    debug: {
      headers: req.headers,
      cookies: req.cookies,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'unknown'
    },
    instructions: 'If Socket.io is not connecting, check that the path and transport settings match between client and server'
  });
}
