const fetch = require('node-fetch');

async function testAuthFlow() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing Authentication Flow...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    console.log(`   Health Status: ${healthResponse.status}`);
    
    // Test 2: NextAuth session endpoint
    console.log('2. Testing NextAuth session endpoint...');
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`);
    console.log(`   Session Status: ${sessionResponse.status}`);
    const sessionData = await sessionResponse.json();
    console.log(`   Session Data:`, sessionData || 'No session');
    
    // Test 3: NextAuth providers endpoint
    console.log('3. Testing NextAuth providers endpoint...');
    const providersResponse = await fetch(`${baseUrl}/api/auth/providers`);
    console.log(`   Providers Status: ${providersResponse.status}`);
    const providersData = await providersResponse.json();
    console.log(`   Available Providers:`, Object.keys(providersData || {}));
    
    // Test 4: Login page accessibility
    console.log('4. Testing login page accessibility...');
    const loginResponse = await fetch(`${baseUrl}/login`);
    console.log(`   Login Page Status: ${loginResponse.status}`);
    
    console.log('\n✅ Auth flow test completed!');
    
  } catch (error) {
    console.error('❌ Error testing auth flow:', error.message);
  }
}

testAuthFlow(); 