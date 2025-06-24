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
      // For testing on localhost, hardcode the URL to ensure proper connection
      const socketUrl = 'http://localhost:3001';

      console.log('[Socket.IO] Connecting to:', socketUrl, 'with timeout:', 30000);
      
      // Add retry logic for Render's sleep/wake cycle
      const maxRetries = 3;
      let retryCount = 0;
      let retryTimeout = 2000; // Start with 2 seconds      // Create socket instance with polling first
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
          token: session.user.id,
          userData: {
            id: session.user.id,
            name: session.user.name || 'Anonymous',
            role: session.user.role || 'USER',
            image: session.user.image || undefined
          }
        }
      });

      // Handle initial connection error (might be due to Render sleeping)
      socketInstance.on('connect_error', (err) => {
        console.error('[Socket.IO] Connection error:', err.message);
        
        // If we're still within retry limits, attempt reconnection
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`[Socket.IO] Retrying connection (${retryCount}/${maxRetries}) in ${retryTimeout/1000}s...`);
          
          setTimeout(() => {
            console.log('[Socket.IO] Attempting reconnection...');
            socketInstance.connect();
          }, retryTimeout);
          
          // Exponential backoff
          retryTimeout *= 2;
        }
      });

      // Store reference
      socketRef.current = socketInstance;      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('[Socket.IO] Connected:', socketInstance.id);
        setSocket(socketInstance);
        setIsConnected(true);
        connectionAttemptsRef.current = 0;
        startHealthCheck(socketInstance);
        
        // Send user data to server on successful connection
        if (session?.user) {
          console.log('[Socket.IO] Sending user data to server');
          socketInstance.emit('set_user_data', {
            id: session.user.id,
            name: session.user.name || 'Anonymous',
            role: session.user.role || 'USER',
            email: session.user.email,
            image: session.user.image
          });
        }
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
