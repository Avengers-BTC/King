import { NextApiRequest, NextApiResponse } from 'next';
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { getToken } from 'next-auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Type assertion for socket.io compatibility
  const socketRes = res as any;
  
  if (!socketRes.socket?.server?.io) {
    console.log('[Socket.IO] Initializing server...');
    
    const httpServer = socketRes.socket.server as HTTPServer;
    const io = new SocketIOServer(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['polling', 'websocket'],
      pingTimeout: 60000,
      pingInterval: 25000,
      allowEIO3: true
    });

    // Store rooms and user data
    const rooms = new Map<string, Set<string>>();
    const userSockets = new Map<string, string>(); // userId -> socketId
    const socketUsers = new Map<string, string>(); // socketId -> userId

    io.on('connection', (socket) => {
      console.log('[Socket.IO] Client connected:', socket.id);

      // Authenticate socket
      const auth = socket.handshake.auth;
      if (!auth?.token) {
        console.log('[Socket.IO] No auth token provided');
        socket.disconnect();
        return;
      }

      const userId = auth.token;
      userSockets.set(userId, socket.id);
      socketUsers.set(socket.id, userId);

      // Handle room joining
      socket.on('join_room', (roomId: string) => {
        if (!roomId) return;
        
        socket.join(roomId);
        console.log(`[Socket.IO] User ${socket.id} (${userId}) joined room ${roomId}`);
        
        // Track room membership
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId)?.add(socket.id);
        
        // Send confirmation to the user
        socket.emit('room_joined', { roomId });
        
        // Notify others in the room
        socket.to(roomId).emit('user_joined', { socketId: socket.id, userId });
        
        // Send user count update
        const userCount = rooms.get(roomId)?.size || 0;
        io.to(roomId).emit('user_count', userCount);
      });

      // Handle room leaving
      socket.on('leave_room', (roomId: string) => {
        if (!roomId) return;
        
        socket.leave(roomId);
        console.log(`[Socket.IO] User ${socket.id} (${userId}) left room ${roomId}`);
        
        // Update room membership
        rooms.get(roomId)?.delete(socket.id);
        if (rooms.get(roomId)?.size === 0) {
          rooms.delete(roomId);
        }
        
        // Notify others in the room
        socket.to(roomId).emit('user_left', { socketId: socket.id, userId });
        
        // Send user count update
        const userCount = rooms.get(roomId)?.size || 0;
        io.to(roomId).emit('user_count', userCount);
      });

      // Handle message sending
      socket.on('send_message', (data: any, callback?: Function) => {
        const { roomId, message, format, sender } = data;
        
        if (!roomId || !message || !sender) {
          console.log('[Socket.IO] Invalid message data');
          if (callback) callback({ error: 'Invalid message data' });
          return;
        }

        console.log(`[Socket.IO] Broadcasting message to room ${roomId}`);
        
        // Create message object
        const messageData = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message,
          format,
          sender,
          timestamp: new Date().toISOString(),
          roomId
        };

        // Broadcast to all users in the room
        io.to(roomId).emit('new_message', messageData);
        
        // Acknowledge the sender
        if (callback) callback();
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { roomId: string, userName?: string, userRole?: string }) => {
        const { roomId, userName, userRole } = data;
        socket.to(roomId).emit('user_typing', { 
          userId, 
          socketId: socket.id, 
          userName, 
          userRole 
        });
      });

      socket.on('typing_end', (roomId: string) => {
        socket.to(roomId).emit('user_stopped_typing', { userId, socketId: socket.id });
      });

      // Handle heartbeat
      socket.on('heartbeat', () => {
        socket.emit('heartbeat-ack');
      });

      // Handle disconnect
      socket.on('disconnect', (reason) => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}, reason: ${reason}`);
        
        // Clean up user data
        const disconnectedUserId = socketUsers.get(socket.id);
        if (disconnectedUserId) {
          userSockets.delete(disconnectedUserId);
          socketUsers.delete(socket.id);
        }
        
        // Remove from all rooms
        rooms.forEach((socketIds, roomId) => {
          if (socketIds.has(socket.id)) {
            socketIds.delete(socket.id);
            socket.to(roomId).emit('user_left', { socketId: socket.id, userId: disconnectedUserId });
            
            // Send updated user count
            const userCount = socketIds.size;
            io.to(roomId).emit('user_count', userCount);
            
            // Clean up empty rooms
            if (socketIds.size === 0) {
              rooms.delete(roomId);
            }
          }
        });
      });
    });

    socketRes.socket.server.io = io;
    console.log('[Socket.IO] Server initialized successfully');
  } else {
    console.log('[Socket.IO] Server already initialized');
  }

  res.end();
} 