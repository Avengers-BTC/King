// Test client for Socket.IO server
const { io } = require("socket.io-client");

// Get the socket server URL from command line argument or use default
const serverUrl = process.argv[2] || 'http://localhost:3001';
console.log(`[Test] Connecting to Socket.IO server at: ${serverUrl}`);

// Create a test user ID
const testUserId = `test-user-${Date.now()}`;

// Connect to the Socket.IO server
const socket = io(serverUrl, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 30000,
  transports: ['polling', 'websocket'],
  path: '/socket.io/', // Explicitly set the path
  auth: {
    token: testUserId
  }
});

// Handle connection events
socket.on('connect', () => {
  console.log('[Test] ✅ Connected to Socket.IO server successfully!');
  console.log('[Test] Socket ID:', socket.id);
  
  // Join a test room
  const testRoomId = `test-room-${Date.now()}`;
  console.log(`[Test] Joining test room: ${testRoomId}`);
  socket.emit('join_room', testRoomId);
  
  // Send a test message after a short delay
  setTimeout(() => {
    console.log('[Test] Sending test message to room');
    socket.emit('send_message', {
      roomId: testRoomId,
      message: 'This is a test message from the client',
      userName: 'Test User',
      userId: testUserId
    });
  }, 2000);
  
  // Leave the room after sending the message
  setTimeout(() => {
    console.log('[Test] Leaving test room');
    socket.emit('leave_room', testRoomId);
  }, 4000);
  
  // Disconnect after all tests
  setTimeout(() => {
    console.log('[Test] Tests completed, disconnecting');
    socket.disconnect();
    process.exit(0);
  }, 6000);
});

// Listen for room events
socket.on('user_joined', (data) => {
  console.log('[Test] ✅ Received user_joined event:', data);
});

socket.on('room_users', (data) => {
  console.log('[Test] ✅ Received room_users event:', data);
});

socket.on('receive_message', (data) => {
  console.log('[Test] ✅ Received message:', data.message);
});

socket.on('user_left', (data) => {
  console.log('[Test] ✅ Received user_left event:', data);
});

// Handle connection errors
socket.on('connect_error', (err) => {
  console.error('[Test] ❌ Connection error:', err.message);
});

socket.on('disconnect', (reason) => {
  console.log('[Test] Disconnected:', reason);
});

// Exit if we don't connect within 10 seconds
setTimeout(() => {
  if (!socket.connected) {
    console.error('[Test] ❌ Failed to connect within timeout period');
    process.exit(1);
  }
}, 10000);
