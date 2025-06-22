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
  const { data: session, status } = useSession();    useEffect(() => {
    // Only attempt connection if authenticated
    if (status !== 'authenticated' || !session) {
      console.log('[Socket.IO] Not authenticated, skipping connection');
      // Clean up existing connection if user logged out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Prevent too many connection attempts
    if (connectionAttempts > 3) {
      console.warn('[Socket.IO] Too many connection attempts, waiting before retry');
      return;
    }
    
    // Get the base URL for socket connection - always use the current window location
    const socketUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    console.log('[Socket.IO] Attempting to connect to:', socketUrl);
    console.log('[Socket.IO] Using path:', '/api/socketio');
    console.log('[Socket.IO] Transport:', ['polling']);
    
    // Check if we're in development or production
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    // First, ping the socketio endpoint to ensure it's available
    if (typeof window !== 'undefined') {
      fetch(`${socketUrl}/api/socketio`)
        .then(res => {
          console.log('[Socket.IO] Endpoint check response:', res.status);
        })
        .catch(err => {
          console.error('[Socket.IO] Endpoint check failed:', err);
        });
    }    const socketInstance = io(socketUrl, {
      path: '/api/socketio',
      addTrailingSlash: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 20000,
      withCredentials: true,
      autoConnect: true,
      // Use polling only for now to ensure compatibility
      transports: ['polling'],
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5
    });socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionAttempts(0);
      console.log('[Socket.IO] Socket connected:', socketInstance.id);
      console.log('[Socket.IO] Connection URL:', socketUrl);
      console.log('[Socket.IO] Connection path:', '/api/socketio');
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[Socket.IO] Socket disconnected:', reason);
      
      // Handle authentication errors
      if (reason === 'io server disconnect') {
        console.log('[Socket.IO] Server disconnected, may be authentication issue');
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket.IO] Connection error:', error.message);
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
      
      // If it's an authentication error, don't keep retrying
      if (error.message?.includes('Authentication') || error.message?.includes('session')) {
        console.warn('[Socket.IO] Authentication error, stopping reconnection attempts');
        socketInstance.disconnect();
      }
    });

    socketInstance.on('error', (error) => {
      console.error('[Socket.IO] Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      console.log('[Socket.IO] Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [status, session, connectionAttempts]);

  // Reset connection attempts when session changes
  useEffect(() => {
    if (status === 'authenticated') {
      setConnectionAttempts(0);
    } else if (status === 'unauthenticated') {
      setConnectionAttempts(0);
      setIsConnected(false);
    }
  }, [status]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
