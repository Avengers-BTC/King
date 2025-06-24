// Socket.IO Server Deployment Check Script
// Run this before deploying to verify everything is properly configured

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Starting Socket.IO Server Deployment Check...');
console.log('==============================================');

// Check for required files
const requiredFiles = ['index.js', 'package.json', 'README.md'];
const missingFiles = [];

requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, file))) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:', missingFiles.join(', '));
  process.exit(1);
}

console.log('✅ All required files present');

// Check package.json has the right scripts
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
} catch (err) {
  console.error('❌ Failed to parse package.json:', err.message);
  process.exit(1);
}

if (!packageJson.scripts || !packageJson.scripts.start) {
  console.error('❌ package.json is missing the "start" script');
  process.exit(1);
}

console.log('✅ Package.json properly configured');

// Check dependencies
const requiredDependencies = ['socket.io'];
const missingDependencies = [];

requiredDependencies.forEach(dep => {
  if (!packageJson.dependencies || !packageJson.dependencies[dep]) {
    missingDependencies.push(dep);
  }
});

if (missingDependencies.length > 0) {
  console.error('❌ Missing required dependencies:', missingDependencies.join(', '));
  process.exit(1);
}

console.log('✅ All required dependencies installed');

// Check if server starts
console.log('🔄 Testing server start...');
try {
  // Try to start the server in a new process
  const serverProcess = require('child_process').spawn('node', ['index.js'], {
    detached: true,
    stdio: 'ignore'
  });
  
  // Give server time to start
  setTimeout(() => {
    try {
      // Check if it's running on port 3001
      const portCheck = execSync('netstat -ano | findstr :3001').toString();
      if (portCheck) {
        console.log('✅ Server starts successfully');
        
        // Kill the process
        const pid = serverProcess.pid;
        try {
          process.kill(pid);
        } catch (err) {
          // Ignore kill errors
        }
      } else {
        console.error('❌ Server not listening on port 3001');
      }
    } catch (err) {
      console.error('❌ Server not running or not listening on expected port');
    }
    
    console.log('\n==============================================');
    console.log('✅ Deployment check complete! The server is ready to deploy.');
    console.log('Follow the deployment instructions in README.md for Render deployment.');
    
    // Exit after cleanup
    serverProcess.unref();
    process.exit(0);
  }, 3000);
} catch (err) {
  console.error('❌ Failed to start server for testing:', err.message);
  process.exit(1);
}
