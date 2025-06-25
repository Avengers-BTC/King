'use client';

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionState: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed';
  liveRooms: Map<string, { djId: string, djName?: string }>;
  djLiveStatus: (roomId: string, isLive: boolean, djName?: string, djId?: string) => void;
  isDjLive: (djId: string) => boolean;
  reconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectionState: 'idle',
  liveRooms: new Map(),
  djLiveStatus: () => {},
  isDjLive: () => false,
  reconnect: () => {}
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed'>('idle');
  const [liveRooms, setLiveRooms] = useState<Map<string, { djId: string, djName?: string }>>(new Map());
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
    // Setup connection state changes
    setConnectionState('connecting');
    
    socketInstance.on('connect', () => {
      const connectTime = Date.now() - connectStart;
      console.log(`[Socket.IO] Connected in ${connectTime}ms`);
      setIsConnected(true);
      setConnectionState('connected');
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
      
      // Show success toast
      try {
        import('sonner').then(({ toast }) => {
          toast.success('Connected to server');
        });
      } catch (e) {
        console.log('[Socket.IO] Toast not available');
      }
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
      setConnectionState('disconnected');

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
      setConnectionState('failed');
      
      // Show error toast
      try {
        import('sonner').then(({ toast }) => {
          toast.error(`Connection error: ${error.message}`);
        });
      } catch (e) {
        console.log('[Socket.IO] Toast not available');
      }
      
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
      setConnectionState('connected');
    });
    
    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[Socket.IO] Reconnection attempt ${attemptNumber}`);
      setConnectionState('reconnecting');
    });
    
    socketInstance.on('reconnect_error', (error) => {
      console.error('[Socket.IO] Reconnection error:', error);
      setConnectionState('failed');
    });
    
    socketInstance.on('reconnect_failed', () => {
      console.error('[Socket.IO] Failed to reconnect after all attempts');
      setIsConnected(false);
      setConnectionState('failed');
    });
    
    // Handle DJ status updates
    socketInstance.on('dj_status_update', (data) => {
      const { djId, isLive, djName, roomId } = data;
      
      // Update live rooms state
      setLiveRooms(prev => {
        const newMap = new Map(prev);
        
        if (isLive && roomId) {
          newMap.set(roomId, { djId, djName });
        } else if (!isLive && roomId) {
          newMap.delete(roomId);
        } else if (!roomId) {
          // If no roomId, try to find and remove by djId
          newMap.forEach((roomData, existingRoomId) => {
            if (roomData.djId === djId) {
              if (isLive) {
                newMap.set(existingRoomId, { djId, djName });
              } else {
                newMap.delete(existingRoomId);
              }
            }
          });
        }
        
        return newMap;
      });
      
      // Show basic status change notification for all users
      try {
        import('sonner').then(({ toast }) => {
          if (isLive) {
            // Basic notification for all signed-in users
            if (session?.user) {
              toast.info(`${djName || 'A DJ'} is now live!`, {
                action: {
                  label: 'View',
                  onClick: () => window.location.href = `/live/${djId}`
                }
              });
            }
          }
        });
      } catch (e) {
        console.log('[Socket.IO] Toast not available');
      }
    });

    // Handle follower-specific notifications
    socketInstance.on('dj_live_notification', async (data) => {
      const { djId, djName } = data;
      
      // Only show follower notifications to actual followers
      if (session?.user?.role === 'USER' && djId !== session?.user?.id) {
        try {
          // Check if current user is following this DJ
          const response = await fetch(`/api/djs/${djId}/following`);
          if (response.ok) {
            const followData = await response.json();
            
            if (followData.isFollowing) {
              import('sonner').then(({ toast }) => {
                toast.success(`🎵 ${djName} is now live!`, {
                  description: 'Your followed DJ just started a live session',
                  action: {
                    label: 'Join Live',
                    onClick: () => window.location.href = `/live/${djId}`
                  },
                  duration: 10000 // Show longer for followers
                });
              });
            }
          }
        } catch (error) {
          console.error('[Socket.IO] Error checking following status:', error);
        }
      }
    });

    // Now connect
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

  // Function to send DJ live status update
  const djLiveStatus = useCallback((roomId: string, isLive: boolean, djName?: string, djId?: string) => {
    if (!socket || !isConnected || !roomId) {
      return;
    }
    
    // Extract DJ ID from room ID if not provided
    let actualDjId = djId;
    if (!actualDjId && roomId.startsWith('live-')) {
      // Room format: live-{djId} or live-{djId}-club{clubId}
      const parts = roomId.split('-');
      if (parts.length >= 2) {
        actualDjId = parts[1];
      }
    }
    
    // Fallback to session user ID if still no DJ ID
    if (!actualDjId) {
      actualDjId = session?.user?.id || 'unknown';
    }
    
    const djData = {
      roomId, 
      isLive,
      djId: actualDjId,
      djName: djName || session?.user?.name || undefined
    };
    
    socket.emit('dj_live', djData);
    
    // Update local state immediately for UI feedback
    if (isLive) {
      setLiveRooms(prev => {
        const newMap = new Map(prev);
        newMap.set(roomId, { 
          djId: djData.djId,
          djName: djData.djName
        });
        return newMap;
      });
    } else {
      setLiveRooms(prev => {
        const newMap = new Map(prev);
        newMap.delete(roomId);
        return newMap;
      });
    }
  }, [socket, isConnected, session]);

  // Function to check if a DJ is currently live
  const isDjLive = useCallback((djId: string) => {
    if (!djId) return false;
    
    // Check if the DJ is live in any room
    // Room IDs are in format: live-{djId} or live-{djId}-club{clubId}
    let isLive = false;
    liveRooms.forEach((roomData, roomId) => {
      // Safety check: ensure roomId and roomData exist
      if (!roomId || !roomData) {
        return;
      }
      
      // Method 1: Check if roomData.djId matches
      if (roomData.djId === djId) {
        isLive = true;
        return;
      }
      
      // Method 2: Check if room ID contains the DJ ID
      if (typeof roomId === 'string' && roomId.includes(`live-${djId}`)) {
        isLive = true;
        return;
      }
    });
    
    return isLive;
  }, [liveRooms]);

  // Reconnect function
  const reconnect = useCallback(() => {
    console.log('[Socket.IO] Manual reconnection triggered');
    
    if (socketRef.current) {
      // First disconnect if connected
      if (socketRef.current.connected) {
        socketRef.current.disconnect();
      }
      
      // Clear any existing reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Reset connection attempts counter to give more chances
      connectionAttemptsRef.current = 0;
      
      // Set state to reconnecting
      setConnectionState('reconnecting');
      
      // Try to reconnect
      socketRef.current.connect();
      
      // Show a toast message
      try {
        // Using dynamic import to avoid SSR issues
        import('sonner').then(({ toast }) => {
          toast.info('Reconnecting to server...');
        });
      } catch (e) {
        console.log('[Socket.IO] Toast not available');
      }
    } else {
      // If no socket instance exists, initialize a new one
      initSocket();
    }
  }, []);

  useEffect(() => {
    initSocket();
  }, [initSocket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, connectionState, liveRooms, djLiveStatus, isDjLive, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
}
