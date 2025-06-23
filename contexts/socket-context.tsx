'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const { data: session, status } = useSession();

  // Effect for socket connection management
  useEffect(() => {
    let socketInstance: Socket | null = null;
    let healthCheckInterval: NodeJS.Timeout | null = null;

    const setupSocket = () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        console.log('[Socket.IO] Not authenticated, skipping connection');
        return;
      }

      console.log('[Socket.IO] Initializing connection with user ID:', session.user.id);

      // Get the base URL for socket connection
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
                       process.env.NEXT_PUBLIC_SITE_URL || 
                       (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

      const isProd = process.env.NODE_ENV === 'production';

      socketInstance = io(socketUrl, {
        path: '/api/socketio',
        addTrailingSlash: false,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        timeout: 20000,
        withCredentials: true,
        autoConnect: true,
        transports: isProd ? ['websocket'] : ['polling', 'websocket']
      });

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('[Socket.IO] Connected:', socketInstance?.id);
        setIsConnected(true);
        setConnectionAttempts(0);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('[Socket.IO] Disconnected:', reason);
        setIsConnected(false);
        if (reason === 'io server disconnect') {
          console.log('[Socket.IO] Server disconnected, may be authentication issue');
        }
      });

      socketInstance.on('error', (error) => {
        console.error('[Socket.IO] Error:', error);
        setIsConnected(false);
      });

      // Set up health checks
      healthCheckInterval = setInterval(() => {
        if (socketInstance?.connected) {
          socketInstance.emit('heartbeat');
        }
      }, 30000); // Every 30 seconds

      setSocket(socketInstance);
    };

    // Initialize socket
    setupSocket();

    // Cleanup function
    return () => {
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
      if (socketInstance) {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [status, session]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
