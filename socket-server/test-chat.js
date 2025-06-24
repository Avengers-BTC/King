// Socket.IO test client for checking connection and chat
const io = require('socket.io-client');

// Configure the socket URL
const socketUrl = process.env.SOCKET_URL || 'http://localhost:3001';

// Create a fake user ID for testing
const userId = `test_${Date.now()}`;
const userName = 'Test User';

// Connect to the server
console.log(`Connecting to ${socketUrl} as user ${userId}...`);
const socket = io(socketUrl, {
  reconnection: true,
  transports: ['polling', 'websocket'],
  auth: {
    token: userId,
    userData: {
      id: userId,
      name: userName,
      role: 'USER'
    }
  }
});

// Handle connection events
socket.on('connect', () => {
  console.log(`Connected with socket ID: ${socket.id}`);
  console.log('Joining test room...');
  
  // Join a test room
  socket.emit('join_room', 'test-room');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log(`Disconnected: ${reason}`);
});

// Handle room events
socket.on('room_joined', (data) => {
  console.log('Successfully joined room:', data.roomId);
  
  // Send a test message
  setTimeout(() => {
    console.log('Sending test message...');
    socket.emit('send_message', {
      roomId: 'test-room',
      message: 'Hello from test client!',
      sender: {
        id: userId,
        name: userName,
        role: 'USER'
      }
    });
  }, 1000);
});

socket.on('user_joined', (data) => {
  console.log('User joined:', data);
});

socket.on('user_left', (data) => {
  console.log('User left:', data);
});

socket.on('new_message', (data) => {
  console.log('New message received:', data);
});

// Set up heartbeat
setInterval(() => {
  if (socket.connected) {
    socket.emit('heartbeat');
  }
}, 25000);

// Clean exit on Ctrl+C
process.on('SIGINT', () => {
  console.log('Disconnecting...');
  socket.disconnect();
  process.exit(0);
});

console.log('Test client running. Press Ctrl+C to exit.');
