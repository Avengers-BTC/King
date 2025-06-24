'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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
  const { data: session, status } = useSession();
  const healthCheckIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const socketRef = useRef<Socket | null>(null);
  const connectionAttemptsRef = useRef(0);
  const maxConnectionAttempts = 3;

  const cleanup = useCallback(() => {
    console.log('[Socket.IO] Cleaning up connection...');
    
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = undefined;
    }
    
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setSocket(null);
    setIsConnected(false);
    connectionAttemptsRef.current = 0;
  }, []);

  const startHealthCheck = useCallback((socket: Socket) => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }

    healthCheckIntervalRef.current = setInterval(() => {
      if (socket.connected) {
        socket.emit('heartbeat');
      }
    }, 25000);
  }, []);

  useEffect(() => {
    if (!session?.user?.id || status !== 'authenticated') {
      console.log('[Socket.IO] Not authenticated, cleaning up');
      cleanup();
      return;
    }

    if (socketRef.current?.connected) {
      console.log('[Socket.IO] Already connected');
      return;
    }

    if (connectionAttemptsRef.current >= maxConnectionAttempts) {
      console.log('[Socket.IO] Max connection attempts reached');
      cleanup();
      return;
    }

    try {      console.log('[Socket.IO] Initializing connection...');
      connectionAttemptsRef.current++;
      
      // Get Socket.IO server URL from environment or fallback to defaults
      const socketUrl = typeof window !== 'undefined' 
        ? (process.env.NEXT_PUBLIC_SOCKET_SERVER || `${window.location.protocol}//${window.location.hostname}:3001`) 
        : 'http://localhost:3001';

      console.log('[Socket.IO] Connecting to:', socketUrl);      // Create socket instance with polling first
      const socketInstance = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 30000,
        autoConnect: true,
        transports: ['polling', 'websocket'],
        path: '/socket.io/',  // Use standard Socket.IO path
        auth: {
          token: session.user.id
        }
      });

      // Store reference
      socketRef.current = socketInstance;

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('[Socket.IO] Connected:', socketInstance.id);
        setSocket(socketInstance);
        setIsConnected(true);
        connectionAttemptsRef.current = 0;
        startHealthCheck(socketInstance);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('[Socket.IO] Disconnected:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('[Socket.IO] Connection error:', error);
        setIsConnected(false);
      });

      socketInstance.on('error', (error) => {
        console.error('[Socket.IO] Socket error:', error);
      });

      socketInstance.on('heartbeat-ack', () => {
        console.log('[Socket.IO] Heartbeat acknowledged');
      });

      return () => {
        cleanup();
      };
    } catch (error) {
      console.error('[Socket.IO] Error initializing socket:', error);
      cleanup();
    }
  }, [session?.user?.id, status, cleanup, startHealthCheck]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
