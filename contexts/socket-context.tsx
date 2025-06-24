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
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER;
    console.log('[Socket.IO] Server URL:', socketServerUrl);
    
    if (!socketServerUrl) {
      console.error('[Socket.IO] Missing NEXT_PUBLIC_SOCKET_SERVER environment variable');
      return;
    }

    const socketInstance = io(socketServerUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      forceNew: true,
      timeout: 20000,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 10,
      rejectUnauthorized: false,
      auth: {
        token: session.user.id,
        userData: {
          id: session.user.id,
          name: session.user.name,
          role: session.user.role,
          image: session.user.image
        },
        attemptCount: connectionAttemptsRef.current
      },
      extraHeaders: {
        Authorization: session?.user?.id || ''
      }
    });

    // Track connection timing
    const connectStart = Date.now();

    // Check server health before connecting
    fetch(socketServerUrl)
      .then(res => res.json())
      .then(health => {
        console.log('[Socket.IO] Server health:', health);
        if (health.coldStart) {
          console.log('[Socket.IO] Server is in cold start, waiting...');
          // Wait a bit longer for cold start
          setTimeout(() => socketInstance.connect(), 2000);
        } else {
          socketInstance.connect();
        }
      })
      .catch(err => {
        console.error('[Socket.IO] Health check failed:', err);
        socketInstance.connect(); // Try connecting anyway
      });

    // Setup event handlers before connecting
    socketInstance.on('connect', () => {
      const connectTime = Date.now() - connectStart;
      console.log(`[Socket.IO] Connected in ${connectTime}ms`);
      setIsConnected(true);
      connectionAttemptsRef.current = 0;
      
      // Initialize heartbeat
      startHealthCheck(socketInstance);
      
      // Send user data
      socketInstance.emit('set_user_data', {
        id: session.user.id,
        name: session.user.name,
        role: session.user.role,
        image: session.user.image
      });
    });

    socketInstance.on('server_ready', (data) => {
      console.log('[Socket.IO] Server is ready:', data);
      // Reconnect if we're not already connected
      if (!socketInstance.connected) {
        socketInstance.connect();
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected:', reason);
      setIsConnected(false);

      // If server initiated disconnect, wait before reconnecting
      if (reason === 'io server disconnect') {
        console.log('[Socket.IO] Server initiated disconnect, waiting before reconnect...');
        setTimeout(() => {
          if (socketInstance) {
            console.log('[Socket.IO] Attempting reconnection after server disconnect...');
            socketInstance.connect();
          }
        }, 2000);
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Socket.IO] Connection error:', error.message);
      
      // Increment attempts and try reconnecting with backoff
      connectionAttemptsRef.current++;
      if (connectionAttemptsRef.current < maxConnectionAttempts) {
        const delay = Math.min(1000 * Math.pow(2, connectionAttemptsRef.current - 1), 10000);
        console.log(`[Socket.IO] Retrying in ${delay}ms (attempt ${connectionAttemptsRef.current}/${maxConnectionAttempts})`);
        
        // Clear any existing timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[Socket.IO] Attempting reconnect...');
          // Check server health before reconnecting
          fetch(socketServerUrl)
            .then(res => res.json())
            .then(health => {
              console.log('[Socket.IO] Server health before reconnect:', health);
              if (!health.coldStart) {
                socketInstance.connect();
              } else {
                console.log('[Socket.IO] Server still in cold start, waiting...');
                setTimeout(() => socketInstance.connect(), 2000);
              }
            })
            .catch(() => socketInstance.connect()); // Try anyway if health check fails
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
    });    // Now connect
    console.log('[Socket.IO] Connecting to:', socketServerUrl);
    socketInstance.connect();

    // Store socket instance
    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Add connection timeout
    const connectionTimeout = setTimeout(() => {
      if (!socketInstance.connected) {
        console.error('[Socket.IO] Connection timed out');
        cleanup();
      }
    }, 30000); // 30 second timeout

    // Clear timeout if we connect successfully
    socketInstance.on('connect', () => {
      clearTimeout(connectionTimeout);
    });

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
