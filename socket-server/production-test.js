// Production-like test for Socket.IO Server
const { io } = require("socket.io-client");
const http = require('http');
const { v4: uuidv4 } = require('uuid');

console.log(`[Production Test] Starting comprehensive Socket.IO server test...`);
console.log(`[Production Test] This test simulates production conditions with multiple users`);

// Server URL - use command line arg or default
const serverUrl = process.argv[2] || 'http://localhost:3001';

// First, check if the server is running with a simple HTTP request
console.log(`[Production Test] Checking if server is running at ${serverUrl}...`);

try {
  const url = new URL(serverUrl);
  const httpOptions = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(httpOptions, (res) => {
    console.log(`[Production Test] Server responded with status code: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log(`[Production Test] Server is running, proceeding with load test...`);
      runLoadTest();
    } else {
      console.error(`[Production Test] Server responded with non-200 status code: ${res.statusCode}`);
      process.exit(1);
    }
  });

  req.on('error', (error) => {
    console.error(`[Production Test] HTTP request error: ${error.message}`);
    console.error('[Production Test] The server does not appear to be running or is not responding to HTTP requests.');
    process.exit(1);
  });

  req.on('timeout', () => {
    console.error('[Production Test] HTTP request timed out.');
    console.error('[Production Test] The server might be running but is not responding in a timely manner.');
    req.destroy();
    process.exit(1);
  });

  req.end();
} catch (err) {
  console.error(`[Production Test] Error setting up HTTP check: ${err.message}`);
  process.exit(1);
}

// Define user types
const USER_TYPES = {
  DJ: { role: 'DJ', prefix: 'dj-test' },
  USER: { role: 'USER', prefix: 'user-test' }
};

// Create test room
const testRoomId = `prod-test-${Date.now()}`;
console.log(`[Production Test] Will use room ID: ${testRoomId}`);

// Track connections and messages
const stats = {
  connections: 0,
  messages: 0,
  errors: 0
};

// Track all sockets
const sockets = [];

// Run the load test with multiple simulated users
function runLoadTest() {
  console.log(`[Production Test] Starting load test with multiple users...`);
  
  // Create 1 DJ
  createUser(USER_TYPES.DJ);
  
  // Create 10 regular users with staggered connections
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      createUser(USER_TYPES.USER);
    }, i * 500); // Connect a new user every 500ms
  }
  
  // Print stats every 2 seconds
  const statsInterval = setInterval(() => {
    console.log(`[Production Test] Stats: ${stats.connections} connections, ${stats.messages} messages, ${stats.errors} errors`);
  }, 2000);
  
  // End test after 20 seconds
  setTimeout(() => {
    clearInterval(statsInterval);
    endTest();
  }, 20000);
}

// Create a user and connect to the Socket.IO server
function createUser(userType) {
  const userId = `${userType.prefix}-${uuidv4().slice(0, 8)}`;
  const userName = `${userType.role} ${userId.slice(-4)}`;
  
  console.log(`[Production Test] Creating ${userType.role}: ${userName}`);
  
  try {
    const socket = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: 3,
      timeout: 10000,
      transports: ['polling', 'websocket'],
      path: '/socket.io/',
      auth: {
        token: userId,
        userData: {
          id: userId,
          name: userName,
          role: userType.role
        }
      }
    });
    
    sockets.push(socket);
    
    // Handle connection events
    socket.on('connect', () => {
      stats.connections++;
      console.log(`[${userName}] Connected with ID: ${socket.id}`);
      
      // Join room
      socket.emit('join_room', testRoomId);
      
      // DJ specific actions
      if (userType.role === 'DJ') {
        // Set DJ live status
        setTimeout(() => {
          socket.emit('dj_live', { roomId: testRoomId, isLive: true });
        }, 1000);
      }
      
      // Send messages periodically
      const messageInterval = setInterval(() => {
        const message = `Test message from ${userName} at ${new Date().toISOString()}`;
        
        socket.emit('send_message', {
          roomId: testRoomId,
          message,
          sender: {
            id: userId,
            name: userName,
            role: userType.role
          }
        });
        
        // Randomly send typing indicators
        if (Math.random() > 0.7) {
          socket.emit('typing_start', {
            roomId: testRoomId,
            userName,
            userRole: userType.role
          });
          
          setTimeout(() => {
            socket.emit('typing_end', testRoomId);
          }, 1000 + Math.random() * 2000);
        }
      }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
      
      // Store the interval for cleanup
      socket.messageInterval = messageInterval;
    });
    
    // Listen for room events
    socket.on('room_joined', (data) => {
      console.log(`[${userName}] Joined room: ${data.roomId}`);
    });
    
    socket.on('user_joined', (data) => {
      // Don't log all joins to keep output cleaner
    });
    
    socket.on('new_message', (data) => {
      stats.messages++;
      // Don't log all messages to keep output cleaner
    });
    
    // Handle errors
    socket.on('connect_error', (err) => {
      stats.errors++;
      console.error(`[${userName}] Connection error:`, err.message);
    });
    
    socket.on('error', (err) => {
      stats.errors++;
      console.error(`[${userName}] Socket error:`, err);
    });
  } catch (err) {
    stats.errors++;
    console.error(`[Production Test] Error creating user ${userName}:`, err.message);
  }
}

// Clean up and end the test
function endTest() {
  console.log(`[Production Test] Test completed. Disconnecting all clients...`);
  
  // Disconnect all sockets
  sockets.forEach(socket => {
    if (socket.messageInterval) {
      clearInterval(socket.messageInterval);
    }
    socket.disconnect();
  });
  
  // Print final stats
  console.log(`\n[Production Test] Final Stats:`);
  console.log(`- Connections: ${stats.connections}`);
  console.log(`- Messages: ${stats.messages}`);
  console.log(`- Errors: ${stats.errors}`);
  
  // Exit with success if no errors, failure if errors
  if (stats.errors === 0) {
    console.log(`\n[Production Test] ✅ Test PASSED - No errors detected`);
    process.exit(0);
  } else {
    console.error(`\n[Production Test] ❌ Test FAILED - ${stats.errors} errors detected`);
    process.exit(1);
  }
}
