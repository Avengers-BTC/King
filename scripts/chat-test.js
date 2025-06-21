// chat-test.js
// Simple script to test chat functionality
// Run with: node chat-test.js

const io = require('socket.io-client');

// Connect to the server
const socket = io('http://localhost:3000', {
  path: '/api/socketio',
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  withCredentials: true,
});

// Create a test room ID
const testRoomId = `test-room-${Date.now()}`;

// Track connection state
socket.on('connect', () => {
  console.log('Connected to server with ID:', socket.id);
  console.log('Joining test room:', testRoomId);
  
  // Join the test room
  socket.emit('join_room', testRoomId);
});

// Handle disconnect
socket.on('disconnect', (reason) => {
  console.log('Disconnected from server:', reason);
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Handle general socket errors
socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Handle room join confirmation
socket.on('room_joined', (data) => {
  console.log('Successfully joined room:', data.roomId);
  console.log('Room data:', data);
  
  // Send a test message
  sendTestMessage();
});

// Handle new messages
socket.on('new_message', (message) => {
  console.log('Received message:', message);
});

// Track room user count
socket.on('user_count', (count) => {
  console.log('Users in room:', count);
});

// Function to send a test message
function sendTestMessage() {
  const testMessage = {
    roomId: testRoomId,
    message: `Test message at ${new Date().toISOString()}`,
    sender: {
      id: 'test-user',
      name: 'Test User',
      role: 'USER'
    }
  };
  
  console.log('Sending test message:', testMessage);
  
  socket.emit('send_message', testMessage, (error) => {
    if (error) {
      console.error('Error sending message:', error);
    } else {
      console.log('Message sent successfully');
    }
  });
}

// Run tests for 10 seconds then disconnect
setTimeout(() => {
  console.log('Test complete, disconnecting...');
  socket.disconnect();
  process.exit(0);
}, 10000);
