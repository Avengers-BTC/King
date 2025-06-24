// Test client for Socket.IO server
const { io } = require("socket.io-client");
const http = require('http');

// First, check if the server is running with a simple HTTP request
console.log(`[Test] Checking if server is running at http://localhost:3001...`);

const url = new URL('http://localhost:3001');
const httpOptions = {
  hostname: url.hostname,
  port: url.port || 80,
  path: '/',
  method: 'GET',
  timeout: 3000
};

const req = http.request(httpOptions, (res) => {
  console.log(`[Test] Server responded with status code: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`[Test] Server response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
    console.log('[Test] Server is running, proceeding with Socket.IO connection test...');
    runSocketTest();
  });
});

req.on('error', (error) => {
  console.error(`[Test] HTTP request error: ${error.message}`);
  console.error('[Test] The server does not appear to be running or is not responding to HTTP requests.');
  console.error('[Test] Please start the server with "node index.js" and try again.');
  process.exit(1);
});

req.on('timeout', () => {
  console.error('[Test] HTTP request timed out.');
  console.error('[Test] The server might be running but is not responding in a timely manner.');
  req.destroy();
  process.exit(1);
});

req.end();

function runSocketTest() {
  // Get the socket server URL from command line argument or use default
  const serverUrl = 'http://localhost:3001';
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
      token: testUserId,
      userData: {
        id: testUserId,
        name: 'Test User',
        role: 'USER'
      }
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
        sender: {
          id: testUserId,
          name: 'Test User',
          role: 'USER'
        }
      }, (response) => {
        console.log('[Test] Message send response:', response);
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
  socket.on('room_joined', (data) => {
    console.log('[Test] ✅ Room joined:', data);
  });

  socket.on('user_joined', (data) => {
    console.log('[Test] ✅ Received user_joined event:', data);
  });

  socket.on('online_users', (users) => {
    console.log('[Test] ✅ Received online_users event:', users);
  });

  socket.on('new_message', (data) => {
    console.log('[Test] ✅ Received message:', data);
  });

  socket.on('user_left', (data) => {
    console.log('[Test] ✅ Received user_left event:', data);
  });

  // Handle connection errors
  socket.on('connect_error', (err) => {
    console.error('[Test] ❌ Connection error:', err.message);
    console.error('[Test] Error details:', err);
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
}
