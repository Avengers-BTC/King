import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

import { useSession } from 'next-auth/react';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated' || !session) {
      console.log('[Socket.IO] Not authenticated, skipping connection');
      return;
    }

    if (connectionAttempts > 5) {
      console.error('Too many connection attempts, stopping reconnection');
      return;
    }    console.log('[Socket.IO] Attempting to connect with session');
    const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
      path: '/api/socketio',
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 30000,
      withCredentials: true, // This will automatically include cookies
      autoConnect: true,
      transports: ['polling', 'websocket'],
      // Increase retry intervals to reduce connection pressure
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5
    });    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionAttempts(0);
      console.log('[Socket.IO] Socket connected:', socketInstance.id);
      
      // Set up a heartbeat to keep the connection alive
      const heartbeatInterval = setInterval(() => {
        if (socketInstance.connected) {
          console.log('[Socket.IO] Sending heartbeat ping');
          socketInstance.emit('heartbeat');
        }
      }, 30000); // Send a heartbeat every 30 seconds
      
      // Store the interval ID on the socket instance for cleanup
      (socketInstance as any).heartbeatInterval = heartbeatInterval;
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[Socket.IO] Socket disconnected:', reason);
      
      // Handle specific disconnect reasons
      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        console.log('[Socket.IO] Server disconnected the socket, attempting to reconnect...');
        socketInstance.connect();
      }
      // For other disconnect reasons, the socket will automatically try to reconnect
    });    socketInstance.on('connect_error', (error) => {
      console.error('[Socket.IO] Socket connection error:', error);
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
    });

    socketInstance.on('error', (error) => {
      console.error('[Socket.IO] Socket error:', error);
      // Don't set isConnected to false for general errors
      // as this doesn't necessarily mean the connection is lost
    });
    
    // Listen for reconnect attempts
    socketInstance.io.on('reconnect_attempt', (attempt) => {
      console.log(`[Socket.IO] Reconnect attempt ${attempt}`);
    });
    
    socketInstance.io.on('reconnect', (attempt) => {
      console.log(`[Socket.IO] Reconnected after ${attempt} attempts`);
      setIsConnected(true);
    });
    
    socketInstance.io.on('reconnect_error', (error) => {
      console.error('[Socket.IO] Reconnect error:', error);
    });

    setSocket(socketInstance);    return () => {
      console.log('[Socket.IO] Cleaning up connection');
      // Clear the heartbeat interval if it exists
      if ((socketInstance as any).heartbeatInterval) {
        clearInterval((socketInstance as any).heartbeatInterval);
      }
      socketInstance.disconnect();
    };
  }, [connectionAttempts, status, session]);

  // Reset connection attempts when session changes
  useEffect(() => {
    if (status === 'authenticated') {
      setConnectionAttempts(0);
    }
  }, [status]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
