import { Server as ServerIO } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import { isRateLimited } from '@/lib/rate-limiter';
import { getToken } from 'next-auth/jwt';

// IMPORTANT: This is the primary Socket.io implementation used by the application.
// DO NOT create a duplicate route in app/api/socketio/ as it will cause conflicts.
// This file uses the Pages Router API format which is different from the App Router.

interface SocketServer extends HTTPServer {
  io?: ServerIO;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

// Basic profanity filter - extend this list as needed
const profanityList = new Set(['badword1', 'badword2']);

function containsProfanity(message: string): boolean {
  return profanityList.has(message.toLowerCase()) ||
    Array.from(profanityList).some(word => message.toLowerCase().includes(word));
}

interface RoomState {
  userCount: number;
  typingUsers: Map<string, { name: string; timestamp: number }>;
  mutedUsers: Set<string>;
  moderators: Set<string>;
  lastMessages: Array<{
    userId: string;
    timestamp: number;
  }>;
  onlineUsers: Map<string, { name: string; role?: string; joinedAt: number }>;
}

const roomStates = new Map<string, RoomState>();
const socketRooms = new Map<string, Set<string>>();

function getRoomState(roomId: string): RoomState {  
  if (!roomStates.has(roomId)) {
    roomStates.set(roomId, {
      userCount: 0,
      typingUsers: new Map(),
      mutedUsers: new Set(),
      moderators: new Set(),
      lastMessages: [],
      onlineUsers: new Map(),
    });
  }
  return roomStates.get(roomId)!;
}

interface Message {
  id: string;
  message: string;
  format?: any;
  sender: {
    id: string;
    name: string;
    role?: string;
  };
  timestamp: string;
  reactions?: Record<string, string[]>;
}

// Store messages for each room
const roomMessages = new Map<string, Message[]>();

const ioHandler = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  console.log('[Socket.IO API] Request received');
  
  // Set headers to allow for CORS
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
    try {
    if (!res.socket.server.io) {
      // Initialize socket server if it hasn't been initialized
      const httpServer: HTTPServer = res.socket.server as any;
      
      console.log('[Socket.IO API] Initializing socket server');
      
      const io = new ServerIO(httpServer, {
        path: '/api/socketio',
        addTrailingSlash: false,
        transports: ['polling', 'websocket'],
        cors: {
          origin: (requestOrigin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!requestOrigin) return callback(null, true);
            
            // Accept requests from the same origin or the NEXTAUTH_URL if specified
            const allowedOrigins = [
              'http://localhost:3000',
              process.env.NEXTAUTH_URL || '',
              process.env.NEXT_PUBLIC_SITE_URL || ''
            ].filter(Boolean);
            
            // If it's a known origin, allow it
            if (allowedOrigins.indexOf(requestOrigin) !== -1) {
              return callback(null, true);
            }
            
            // In production, also try to match by hostname
            if (process.env.NODE_ENV === 'production') {
              try {
                const requestHost = new URL(requestOrigin).hostname;
                const allowedHosts = allowedOrigins
                  .map(origin => {
                    try { return new URL(origin).hostname; } 
                    catch { return null; }
                  })
                  .filter(Boolean);
                
                if (allowedHosts.some(host => host === requestHost)) {
                  return callback(null, true);
                }
              } catch (e) {
                console.error('[Socket.IO] Error parsing origin:', e);
              }
            }
            
            // For security, log but still allow in development
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`[Socket.IO] Unknown origin: ${requestOrigin} - allowing in development`);
              return callback(null, true);
            }
            
            // In production, default to allowing all origins to prevent immediate breakage
            // This should be restricted in the future
            console.warn(`[Socket.IO] Unknown origin: ${requestOrigin} - allowing in production for compatibility`);
            return callback(null, true);
          },
          methods: ['GET', 'POST'],
          credentials: true
        },
        allowRequest: async (req, callback) => {
          // Allow all connections at the socket level
          // We'll handle authentication in the middleware
          callback(null, true);
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        connectionStateRecovery: {
          maxDisconnectionDuration: 2 * 60 * 1000,
          skipMiddlewares: true,
        },
      });
      
      // Middleware to authenticate socket connections
      io.use(async (socket, next) => {
        try {
          const cookie = socket.handshake.headers.cookie;
          console.log('[Socket.IO] Received cookies:', cookie);

          if (!cookie) {
            console.log('[Socket.IO] No cookies found in handshake');
            return next(new Error('No session cookie found'));
          }

          // Parse cookies to get the session token
          const cookies = cookie.split(';').reduce((acc, curr) => {
            const [key, value] = curr.trim().split('=');
            acc[key] = value;
            return acc;
          }, {} as Record<string, string>);

          // Next.js session token is stored in the next-auth.session-token cookie
          const sessionToken = cookies['next-auth.session-token'] || 
                              cookies['__Secure-next-auth.session-token']; // For secure contexts
          
          if (!sessionToken) {
            console.log('[Socket.IO] No session token found in cookies');
            return next(new Error('No session token found'));
          }

          const token = await getToken({
            req: {
              cookies: {
                'next-auth.session-token': sessionToken,
                '__Secure-next-auth.session-token': sessionToken
              }
            } as any,
            secret: process.env.NEXTAUTH_SECRET,
          });

          if (!token) {
            console.log('[Socket.IO] Failed to verify session token');
            return next(new Error('Invalid session token'));
          }

          // Attach user data to socket
          socket.data.user = {
            id: token.sub,
            name: token.name || 'Anonymous',
            role: token.role || 'USER',
            email: token.email
          };

          console.log(`[Socket.IO] User authenticated: ${socket.data.user.name} (${socket.data.user.role})`);
          next();
        } catch (error) {
          console.error('[Socket.IO] Authentication error:', error);
          return next(new Error('Authentication failed'));
        }
      });      // Error handling middleware
      io.engine.on("connection_error", (err) => {
        console.log("[Socket.IO] Connection error:", err);
      });      // Track rooms for each socket
      const socketRooms = new Map<string, Set<string>>();

      // Handle socket connections
      io.on('connection', async (socket) => {
        console.log(`[Socket.IO] Client connected: ${socket.id}`);      // Handle room joining
      socket.on('join_room', async (roomId) => {
        try {
          // Check if already in room to prevent duplicate counts
          if (socket.rooms.has(roomId)) {
            console.log(`[Socket.IO] Client ${socket.id} already in room ${roomId}, skipping join`);
            
            // Even if already joined, still send the current state to sync the client
            const state = getRoomState(roomId);
            
            // Get actual count of clients in the room from Socket.IO
            const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
            
            // Force room size to be accurate by counting actual sockets in the room
            const connectedClients = Array.from(io.sockets.sockets.values())
              .filter(s => s.rooms.has(roomId))
              .length;
            
            console.log(`[Socket.IO] Room ${roomId} sizes - adapter: ${roomSize}, actual: ${connectedClients}`);
            
            // Use the actual count
            state.userCount = connectedClients;
            
            // Just send the current state but don't re-join
            socket.emit('room_joined', { 
              roomId,
              userCount: state.userCount,
              userId: socket.data?.user?.id,
              messages: roomMessages.get(roomId) || []
            });
            
            // Also update all clients with the accurate count
            io.to(roomId).emit('user_count', state.userCount);
            
            return;
          }
          
          // Join the room
          await socket.join(roomId);
          
          // Track room membership
          if (!socketRooms.has(socket.id)) {
            socketRooms.set(socket.id, new Set());
          }
          socketRooms.get(socket.id)?.add(roomId);

          console.log(`[Socket.IO] Client ${socket.id} joined room ${roomId}`);
          
          // Get room state
          const state = getRoomState(roomId);
          
          // Force room size to be accurate by counting actual sockets in the room
          const connectedClients = Array.from(io.sockets.sockets.values())
            .filter(s => s.rooms.has(roomId))
            .length;
          
          console.log(`[Socket.IO] Room ${roomId} has ${connectedClients} connected clients`);
          
          // Use the actual count
          state.userCount = connectedClients;
          
          // Update online users
          if (socket.data?.user) {
            state.onlineUsers.set(socket.data.user.id, {
              name: socket.data.user.name,
              role: socket.data.user.role,
              joinedAt: Date.now()
            });
            
            // Send updated online users list to all clients in the room
            const onlineUsersList = Array.from(state.onlineUsers.entries()).map(([id, data]) => ({
              id,
              name: data.name,
              role: data.role
            }));
            
            io.to(roomId).emit('online_users', onlineUsersList);
          }
              
          // Send join confirmation and recent messages
          socket.emit('room_joined', { 
            roomId,
            userCount: state.userCount,
            userId: socket.data?.user?.id,
            messages: roomMessages.get(roomId) || []
          });
          
          // Notify room of updated user count
          io.to(roomId).emit('user_count', state.userCount);
        } catch (error) {
          console.error(`[Socket.IO] Error joining room ${roomId}:`, error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });// Handle room leaving
      socket.on('leave_room', (roomId) => {
        if (!socket.rooms.has(roomId)) {
          console.log(`[Socket.IO] Client ${socket.id} not in room ${roomId}, skipping leave`);
          return;
        }
        
        socket.leave(roomId);
        console.log(`[Socket.IO] Client ${socket.id} left room ${roomId}`);
        
        // Update tracking
        socketRooms.get(socket.id)?.delete(roomId);
        
        // Update room state
        const state = getRoomState(roomId);
        
        // Get actual count of clients in the room from Socket.IO
        const actualClientsInRoom = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        
        // Sync our count with actual count
        state.userCount = actualClientsInRoom;
        
        console.log(`[Socket.IO] Room ${roomId} now has ${state.userCount} users`);
        
        state.moderators.delete(socket.id);
        state.typingUsers.delete(socket.id);
        
        // Notify room of updated user count
        io.to(roomId).emit('user_count', state.userCount);
        
        // If it was a DJ, notify room
        if (socket.data?.user?.role === 'DJ') {
          io.to(roomId).emit('dj_presence', {
            present: false,
            name: socket.data.user.name
          });
        }
      });// Handle DJ live status
      socket.on('dj_live', ({ roomId, isLive }) => {        console.log(`[Socket.IO] DJ ${socket.data?.user?.name} ${isLive ? 'went live' : 'ended live'} in room ${roomId}`);
        io.to(roomId).emit('dj_status', { isLive });
      });
      
      // Handle message sending
      socket.on('send_message', async (data, callback) => {
        try {
          const { roomId, message, format, sender } = data;
          
          // Validation
          if (!message || !message.trim()) {
            if (typeof callback === 'function') {
              callback({ message: 'Message cannot be empty' });
            }
            return;
          }
          
          // Verify socket is actually in this room
          if (!socket.rooms.has(roomId)) {            if (typeof callback === 'function') {
              callback({ message: 'Not in room' });
            }
            return;
          }
          
          // Create message object with better ID generation
          const messageId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
          const newMessage = {
            id: messageId,
            message: message.trim(),
            format: format, // Add formatting information
            sender: {
              ...sender,
              role: socket.data?.user?.role || sender.role || 'USER',
            },
            timestamp: new Date().toISOString(),
            reactions: {} // Initialize empty reactions
          };

          // Store message
          if (!roomMessages.has(roomId)) {
            roomMessages.set(roomId, []);
          }          const roomMessageList = roomMessages.get(roomId)!;
          roomMessageList.push(newMessage);
          
          // Keep only last 100 messages
          if (roomMessageList.length > 100) {
            roomMessageList.splice(0, roomMessageList.length - 100);
          }
          
          // Broadcast to ALL clients in the room including sender
          io.in(roomId).emit('new_message', newMessage);

          // Acknowledge successful send
          if (typeof callback === 'function') {
            callback();
          }
        } catch (error) {
          console.error('[Socket.IO] Error handling message:', error);
          if (typeof callback === 'function') {
            console.log(`[Socket.IO] Sending error in callback to ${socket.data?.user?.name || 'unknown user'}`, error);
            callback({ message: 'Failed to send message' });
          } else {
            socket.emit('error', { message: 'Failed to send message' });          }
        }
      });
      
      // Handle reactions
      socket.on('add_reaction', (data) => {
        try {
          const { roomId, messageId, emoji, userId } = data;
          
          if (!socket.rooms.has(roomId)) {
            return;
          }
          
          const roomMessageList = roomMessages.get(roomId);
          if (!roomMessageList) return;
          
          const message = roomMessageList.find(msg => msg.id === messageId);
          if (!message) return;
          
          // Initialize reactions if not present
          if (!message.reactions) {
            message.reactions = {};
          }
          
          // Initialize emoji array if not present
          if (!message.reactions[emoji]) {
            message.reactions[emoji] = [];
          }
          
          // Add user to reactions if not already there
          if (!message.reactions[emoji].includes(userId)) {
            message.reactions[emoji].push(userId);
            
            // Broadcast the reaction
            io.to(roomId).emit('reaction_added', { messageId, emoji, userId });
          }
        } catch (error) {
          console.error('[Socket.IO] Error handling reaction:', error);
        }
      });
      
      socket.on('remove_reaction', (data) => {
        try {
          const { roomId, messageId, emoji, userId } = data;
          
          if (!socket.rooms.has(roomId)) {
            return;
          }
          
          const roomMessageList = roomMessages.get(roomId);
          if (!roomMessageList) return;
          
          const message = roomMessageList.find(msg => msg.id === messageId);
          if (!message || !message.reactions || !message.reactions[emoji]) return;
          
          // Remove user from reactions
          message.reactions[emoji] = message.reactions[emoji].filter(id => id !== userId);
          
          // Remove emoji key if no users left
          if (message.reactions[emoji].length === 0) {
            delete message.reactions[emoji];
          }
          
          // Broadcast the reaction removal
          io.to(roomId).emit('reaction_removed', { messageId, emoji, userId });
        } catch (error) {
          console.error('[Socket.IO] Error handling reaction removal:', error);
        }
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        
        // Clean up room memberships
        const rooms = socketRooms.get(socket.id) || new Set();
        
        // For each room the user was in
        rooms.forEach(roomId => {
          console.log(`[Socket.IO] Cleaning up ${socket.id} from room ${roomId}`);
          
          const state = getRoomState(roomId);
            // Clean up user data from room
          state.typingUsers.delete(socket.id);
          state.moderators.delete(socket.id);
          
          // Remove from online users if user was authenticated
          if (socket.data?.user?.id) {
            state.onlineUsers.delete(socket.data.user.id);
            
            // Send updated online users list
            const onlineUsersList = Array.from(state.onlineUsers.entries()).map(([id, data]) => ({
              id,
              name: data.name,
              role: data.role
            }));
            
            io.to(roomId).emit('online_users', onlineUsersList);
          }
          
          // Get actual count of clients in the room
          const roomClients = io.sockets.adapter.rooms.get(roomId);
          const clientCount = roomClients ? roomClients.size : 0;
          
          // Update the user count
          state.userCount = clientCount;
          
          console.log(`[Socket.IO] Room ${roomId} now has ${state.userCount} users`);
          
          // Notify room of updated user count
          io.to(roomId).emit('user_count', state.userCount);
          
          // If it was a DJ, notify room
          if (socket.data?.user?.role === 'DJ') {
            io.to(roomId).emit('dj_presence', {
              present: false,
              name: socket.data.user?.name || 'Unknown DJ'
            });
          }
        });
        
        // Remove the socket from our tracking
        socketRooms.delete(socket.id);
      });

      // Handle typing indicators
      socket.on('typing_start', (roomId) => {
        if (!socket.data?.user) return;
        
        const state = getRoomState(roomId);
        state.typingUsers.set(socket.id, {
          name: socket.data.user.name || 'Anonymous',
          timestamp: Date.now()
        });
        
        // Broadcast typing users to room
        const typingUsers = Array.from(state.typingUsers.entries())
          .map(([socketId, data]) => ({
            id: socketId,
            name: data.name
          }));
          
        io.to(roomId).emit('typing_update', typingUsers);
      });
      
      socket.on('typing_end', (roomId) => {
        const state = getRoomState(roomId);
        state.typingUsers.delete(socket.id);
        
        // Broadcast updated typing users to room
        const typingUsers = Array.from(state.typingUsers.entries())
          .map(([socketId, data]) => ({
            id: socketId,
            name: data.name
          }));
          
        io.to(roomId).emit('typing_update', typingUsers);
      });

      // Handle heartbeat pings to keep connections alive
      socket.on('heartbeat', () => {        // Simply respond with a pong to keep the connection alive
        socket.emit('heartbeat_pong');
        console.log(`[Socket.IO] Heartbeat received from ${socket.id}`);
      });
    });
    
    // Set up a periodic room audit to fix any count inconsistencies
    const roomAuditInterval = setInterval(() => {
      try {
        console.log('[Socket.IO] Running room audit');
        
        // First, check all connected clients
        const connectedClients = new Set(Array.from(io.sockets.sockets.keys()));        console.log(`[Socket.IO] Connected clients: ${connectedClients.size}`);
        
        // Clean up any tracking for disconnected clients
        socketRooms.forEach((rooms, socketId) => {
          if (!connectedClients.has(socketId)) {
            console.log(`[Socket.IO] Cleaning up tracking for disconnected client: ${socketId}`);
            socketRooms.delete(socketId);
          }
        });
        
        // Audit each room
        roomStates.forEach((state, roomId) => {
          // Count actual clients in the room
          const actualClients = Array.from(io.sockets.sockets.values())
            .filter(socket => socket.rooms.has(roomId));
            
          const actualCount = actualClients.length;
          
          console.log(`[Socket.IO] Room ${roomId} audit: stored=${state.userCount}, actual=${actualCount}`);
          
          // If there's a discrepancy, fix it
          if (state.userCount !== actualCount) {
            console.log(`[Socket.IO] Fixing user count for room ${roomId}: ${state.userCount} → ${actualCount}`);
            state.userCount = actualCount;
            io.to(roomId).emit('user_count', actualCount);
          }
          
          // If room is empty, consider cleaning it up
          if (actualCount === 0) {
            console.log(`[Socket.IO] Room ${roomId} is empty, marking for cleanup`);
            // Optional: remove empty rooms after a while
            // roomStates.delete(roomId);
            // roomMessages.delete(roomId);
          }
        });
      } catch (error) {
        console.error('[Socket.IO] Error during room audit:', error);
      }
    }, 30000); // Run every 30 seconds
    
    // Ensure the interval is cleaned up when the server restarts
    (res.socket.server as any).roomAuditInterval = roomAuditInterval;    // Store the socket server instance
    res.socket.server.io = io;
  }
  
  res.end();
} catch (error) {
  console.error('[Socket.IO] Setup error:', error);
  res.status(500).end();
}
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
