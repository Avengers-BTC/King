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
  const maxConnectionAttempts = 5; // Increased from 3
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Enhanced cleanup with timeout clearing
  const cleanup = useCallback(() => {
    console.log('[Socket.IO] Cleaning up connection...');
    
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
      healthCheckIntervalRef.current = undefined;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
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

  // Initialize socket with optimized settings
  const initSocket = useCallback(() => {
    if (!session?.user || status !== 'authenticated') return;
    
    cleanup();

    console.log('[Socket.IO] Initializing socket connection...');
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],
      // Optimized timeouts for free tier
      timeout: 20000,           // 20s connect timeout
      reconnectionDelay: 1000,  // Start with 1s delay
      reconnectionDelayMax: 10000, // Max 10s delay
      // Retry logic
      reconnectionAttempts: 5,
      autoConnect: false // We'll connect manually after setup
    });

    // Track connection timing
    const connectStart = Date.now();

    // Setup event handlers before connecting
    socketInstance.on('connect', () => {
      const connectTime = Date.now() - connectStart;
      console.log(`[Socket.IO] Connected in ${connectTime}ms`);
      setIsConnected(true);
      connectionAttemptsRef.current = 0;
      
      // Send user data
      if (session?.user) {
        socketInstance.emit('user:join', {
          userId: session.user.id,
          name: session.user.name,
          image: session.user.image
        });
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket.IO] Connection error:', error.message);
      
      // Increment attempts and try reconnecting with backoff
      connectionAttemptsRef.current++;
      if (connectionAttemptsRef.current < maxConnectionAttempts) {
        const delay = Math.min(1000 * Math.pow(2, connectionAttemptsRef.current - 1), 10000);
        console.log(`[Socket.IO] Retrying in ${delay}ms (attempt ${connectionAttemptsRef.current}/${maxConnectionAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[Socket.IO] Attempting reconnect...');
          socketInstance.connect();
        }, delay);
      } else {
        console.error('[Socket.IO] Max connection attempts reached');
        cleanup();
      }
    });

    socketInstance.on('error', (error) => {
      console.error('[Socket.IO] Socket error:', error);
    });

    socketInstance.on('heartbeat-ack', () => {
      console.log('[Socket.IO] Heartbeat acknowledged');
    });

    // Handle reconnection events
    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`[Socket.IO] Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });
    
    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[Socket.IO] Reconnection attempt ${attemptNumber}`);
    });
    
    socketInstance.on('reconnect_error', (error) => {
      console.error('[Socket.IO] Reconnection error:', error);
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.error('[Socket.IO] Failed to reconnect after all attempts');
      setIsConnected(false);
    });

    // Now connect
    console.log('[Socket.IO] Connecting...');
    socketInstance.connect();

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => cleanup();
  }, [session, status, cleanup]);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
