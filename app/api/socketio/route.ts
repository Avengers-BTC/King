import { NextRequest, NextResponse } from 'next/server';

// Set dynamic rendering to ensure our Socket.IO server is properly initialized
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  console.log('[Socket.IO API] GET request received');
  
  // This endpoint provides information about the Socket.IO server configuration
  // The Socket.IO server is deployed separately on Railway/Render
  
  // Use environment variables to configure Socket.IO server address
  const socketServer = process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001';
  
  return NextResponse.json({ 
    status: 'Socket.IO server is running',
    server: socketServer,
    instructions: `Connect to ${socketServer} for Socket.IO` 
  });
}
