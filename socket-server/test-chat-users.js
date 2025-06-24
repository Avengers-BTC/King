// Create two test users - one "DJ" and one regular user

const { io } = require("socket.io-client");

// Get the socket server URL from command line argument or use default
const serverUrl = process.argv[2] || 'http://localhost:3001';
console.log(`[Test] Connecting to Socket.IO server at: ${serverUrl}`);

// Create test room ID
const testRoomId = `test-room-${Date.now()}`;

// Create DJ user
const djUserId = `dj-test-${Date.now()}`;
const djSocket = io(serverUrl, {
  reconnection: true,
  reconnectionAttempts: 3,
  timeout: 30000,
  transports: ['polling', 'websocket'],
  auth: {
    token: djUserId,
    userData: {
      id: djUserId,
      name: 'Test DJ',
      role: 'DJ'
    }
  }
});

// Create regular user
const userUserId = `user-test-${Date.now()}`;
const userSocket = io(serverUrl, {
  reconnection: true,
  reconnectionAttempts: 3,
  timeout: 30000,
  transports: ['polling', 'websocket'],
  auth: {
    token: userUserId,
    userData: {
      id: userUserId,
      name: 'Test User',
      role: 'USER'
    }
  }
});

// Handle DJ socket events
djSocket.on('connect', () => {
  console.log(`[DJ] Connected with ID: ${djSocket.id}`);
  console.log(`[DJ] Joining room: ${testRoomId}`);
  djSocket.emit('join_room', testRoomId);
  
  // Send DJ live status
  setTimeout(() => {
    djSocket.emit('dj_live', { roomId: testRoomId, isLive: true });
    console.log(`[DJ] Sent live status for room ${testRoomId}`);
  }, 1000);
});

djSocket.on('room_joined', (data) => {
  console.log(`[DJ] Joined room: ${data.roomId}`);
});

djSocket.on('user_joined', (data) => {
  console.log(`[DJ] User joined:`, data);
});

djSocket.on('new_message', (data) => {
  console.log(`[DJ] Received message:`, data);
});

djSocket.on('connect_error', (error) => {
  console.error(`[DJ] Connection error:`, error);
});

// Handle regular user socket events
userSocket.on('connect', () => {
  console.log(`[User] Connected with ID: ${userSocket.id}`);
  
  // Join room after DJ has joined
  setTimeout(() => {
    console.log(`[User] Joining room: ${testRoomId}`);
    userSocket.emit('join_room', testRoomId);
  }, 2000);
  
  // Send message after joining
  setTimeout(() => {
    console.log(`[User] Sending message to room ${testRoomId}`);
    userSocket.emit('send_message', {
      roomId: testRoomId,
      message: 'Hello from regular user!',
      sender: {
        id: userUserId,
        name: 'Test User',
        role: 'USER'
      }
    }, (response) => {
      console.log(`[User] Message send response:`, response);
    });
  }, 3000);
  
  // Start typing
  setTimeout(() => {
    console.log(`[User] Sending typing indicator`);
    userSocket.emit('typing_start', {
      roomId: testRoomId,
      userName: 'Test User',
      userRole: 'USER'
    });
  }, 4000);
  
  // Stop typing
  setTimeout(() => {
    console.log(`[User] Stopping typing indicator`);
    userSocket.emit('typing_end', testRoomId);
  }, 5000);
});

userSocket.on('room_joined', (data) => {
  console.log(`[User] Joined room: ${data.roomId}`);
});

userSocket.on('dj_status_update', (data) => {
  console.log(`[User] DJ status update:`, data);
});

userSocket.on('new_message', (data) => {
  console.log(`[User] Received message:`, data);
});

userSocket.on('user_typing', (data) => {
  console.log(`[User] Someone is typing:`, data);
});

userSocket.on('connect_error', (error) => {
  console.error(`[User] Connection error:`, error);
});

// Have DJ send a message
setTimeout(() => {
  console.log(`[DJ] Sending message to room ${testRoomId}`);
  djSocket.emit('send_message', {
    roomId: testRoomId,
    message: 'Hello from DJ!',
    sender: {
      id: djUserId,
      name: 'Test DJ',
      role: 'DJ'
    }
  }, (response) => {
    console.log(`[DJ] Message send response:`, response);
  });
}, 6000);

// Exit after all tests
setTimeout(() => {
  console.log('[Test] Tests completed, disconnecting...');
  djSocket.disconnect();
  userSocket.disconnect();
  console.log('[Test] Test completed successfully!');
  process.exit(0);
}, 10000);

// Handle errors and exit
process.on('uncaughtException', (error) => {
  console.error('[Test] Uncaught exception:', error);
  process.exit(1);
});

// Exit if we don't connect within 10 seconds
setTimeout(() => {
  if (!djSocket.connected || !userSocket.connected) {
    console.error('[Test] Failed to connect within timeout period');
    process.exit(1);
  }
}, 8000);
