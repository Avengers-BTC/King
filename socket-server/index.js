const { createServer } = require('http');
const { Server } = require('socket.io');

console.log('[Socket.IO] Starting standalone server...');

// Create a standalone HTTP server
const httpServer = createServer((req, res) => {
  // Simple health check endpoint
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'OK',
    message: 'Socket.IO server is running',
    timestamp: new Date().toISOString()
  }));
});

// Initialize Socket.IO with the standalone server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
  path: '/socket.io/', // Ensure the path is explicitly set
  connectTimeout: 45000
});

// Store rooms and user data
const rooms = new Map();
const userSockets = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> userId

// Set up connection handling
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
  socket.on('join_room', (roomId) => {
    if (!roomId) return;
    
    socket.join(roomId);
    console.log(`[Socket.IO] User ${socket.id} (${userId}) joined room ${roomId}`);
    
    // Track room membership
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(userId);
    
    // Notify room about new user
    io.to(roomId).emit('user_joined', { userId, roomId });
    
    // Send room user list
    const roomUsers = Array.from(rooms.get(roomId));
    io.to(roomId).emit('room_users', { roomId, users: roomUsers });
  });
  
  // Handle heartbeat for keeping connection alive
  socket.on('heartbeat', () => {
    console.log(`[Socket.IO] Heartbeat received from ${socket.id} (${userId})`);
    socket.emit('heartbeat_ack', { timestamp: new Date().toISOString() });
  });
  
  // Handle chat messages
  socket.on('send_message', (data) => {
    const { roomId, message, userName, userId: messageUserId } = data;
    
    if (!roomId || !message) return;
    
    console.log(`[Socket.IO] Message in room ${roomId} from ${userName || messageUserId}: ${message.substring(0, 50)}`);
    
    // Broadcast message to room
    io.to(roomId).emit('receive_message', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle typing indicators
  socket.on('typing', (data) => {
    const { roomId, userName, userId: typingUserId } = data;
    if (!roomId) return;
    
    socket.to(roomId).emit('user_typing', { 
      userId: typingUserId, 
      userName, 
      roomId 
    });
  });
  
  // Handle user leaving
  socket.on('leave_room', (roomId) => {
    if (!roomId) return;
    
    handleLeaveRoom(socket, roomId, userId);
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] User disconnected: ${socket.id} (${userId})`);
    
    // Clean up all rooms this user was in
    for (const [roomId, users] of rooms.entries()) {
      if (users.has(userId)) {
        handleLeaveRoom(socket, roomId, userId);
      }
    }
    
    // Clean up user mappings
    userSockets.delete(userId);
    socketUsers.delete(socket.id);
  });
});

// Helper function for leave room logic
function handleLeaveRoom(socket, roomId, userId) {
  socket.leave(roomId);
  console.log(`[Socket.IO] User ${socket.id} (${userId}) left room ${roomId}`);
  
  // Update room tracking
  if (rooms.has(roomId)) {
    rooms.get(roomId).delete(userId);
    
    // If room is empty, remove it
    if (rooms.get(roomId).size === 0) {
      rooms.delete(roomId);
      console.log(`[Socket.IO] Room ${roomId} is now empty and has been removed`);
    } else {
      // Notify room about user leaving
      io.to(roomId).emit('user_left', { userId, roomId });
      
      // Send updated room user list
      const roomUsers = Array.from(rooms.get(roomId));
      io.to(roomId).emit('room_users', { roomId, users: roomUsers });
    }
  }
}

// Get the port from environment or use 3001 as fallback
const PORT = process.env.PORT || 3001;

// Start the server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Socket.IO] Server running on port ${PORT}`);
});
