import { NextApiRequest, NextApiResponse } from 'next';

// This is a simple health check for the Socket.io implementation
// It allows you to verify that the Socket.io route is accessible
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    status: 'ok',
    message: 'Socket.io endpoint is available',
    timestamp: new Date().toISOString(),
    note: 'This is a health check for the Pages Router Socket.io implementation'
  });
}
