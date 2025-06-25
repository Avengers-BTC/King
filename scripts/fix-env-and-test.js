const { PrismaClient } = require('@prisma/client');

// Test database connection
async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  // First check if DATABASE_URL is properly formatted
  const dbUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL exists:', !!dbUrl);
  console.log('DATABASE_URL format:', dbUrl ? 'OK' : 'MISSING');
  
  if (dbUrl) {
    console.log('DATABASE_URL preview:', dbUrl.substring(0, 50) + '...');
  }
  
  try {
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test if our new tables exist
    try {
      const chatRooms = await prisma.chatRoom.findMany({ take: 1 });
      console.log('✅ ChatRoom table exists');
    } catch (error) {
      console.log('❌ ChatRoom table missing:', error.message);
    }
    
    try {
      const chatMessages = await prisma.chatMessage.findMany({ take: 1 });
      console.log('✅ ChatMessage table exists');
    } catch (error) {
      console.log('❌ ChatMessage table missing:', error.message);
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Possible fixes:');
    console.log('1. Check if DATABASE_URL is properly formatted (no line breaks)');
    console.log('2. Run: npx prisma db push');
    console.log('3. Check if Neon database is active');
  }
}

// Test environment variables
function testEnvironmentVariables() {
  console.log('\n=== Environment Variables ===');
  
  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_SOCKET_SERVER'
  ];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    console.log(`${varName}: ${value ? '✅ SET' : '❌ MISSING'}`);
    
    if (varName === 'DATABASE_URL' && value) {
      // Check for line breaks or malformed URL
      if (value.includes('\n') || value.includes('\r')) {
        console.log('  ⚠️  WARNING: DATABASE_URL contains line breaks!');
      }
      if (!value.startsWith('postgresql://')) {
        console.log('  ⚠️  WARNING: DATABASE_URL doesn\'t start with postgresql://');
      }
    }
  });
}

// Main function
async function main() {
  console.log('🔍 Diagnosing environment and database issues...\n');
  
  testEnvironmentVariables();
  await testDatabaseConnection();
  
  console.log('\n📝 Recommended actions:');
  console.log('1. Fix DATABASE_URL line breaks in .env.development.local');
  console.log('2. Ensure NEXT_PUBLIC_SOCKET_SERVER points to: https://king-w38u.onrender.com');
  console.log('3. Run: npx prisma db push');
  console.log('4. Restart the development server');
}

main().catch(console.error); 