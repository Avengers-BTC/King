const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists:', existingUser.email);
      console.log('   ID:', existingUser.id);
      console.log('   Name:', existingUser.name);
      console.log('   Role:', existingUser.role);
      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
      }
    });

    console.log('✅ Test user created successfully!');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('   ID:', testUser.id);
    console.log('   Role:', testUser.role);

    return testUser;

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
}

async function createTestDJ() {
  try {
    // Check if test DJ already exists
    const existingDJ = await prisma.user.findUnique({
      where: { email: 'testdj@example.com' }
    });

    if (existingDJ) {
      console.log('✅ Test DJ already exists:', existingDJ.email);
      console.log('   ID:', existingDJ.id);
      console.log('   Name:', existingDJ.name);
      console.log('   Role:', existingDJ.role);
      return existingDJ;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('djpass123', 12);

    // Create test DJ user
    const testDJ = await prisma.user.create({
      data: {
        email: 'testdj@example.com',
        name: 'Test DJ',
        password: hashedPassword,
        role: 'DJ',
        emailVerified: new Date(),
      }
    });

    // Create DJ profile
    const djProfile = await prisma.dj.create({
      data: {
        userId: testDJ.id,
        genres: ['Electronic', 'House', 'Techno'],
        bio: 'Test DJ for development and testing',
        status: 'OFFLINE',
      }
    });

    console.log('✅ Test DJ created successfully!');
    console.log('   Email: testdj@example.com');
    console.log('   Password: djpass123');
    console.log('   ID:', testDJ.id);
    console.log('   Role:', testDJ.role);
    console.log('   DJ Profile ID:', djProfile.id);

    return testDJ;

  } catch (error) {
    console.error('❌ Error creating test DJ:', error);
    throw error;
  }
}

async function main() {
  console.log('🔧 Creating test users for development...\n');

  try {
    await createTestUser();
    console.log('');
    await createTestDJ();
    
    console.log('\n🎉 Test users created successfully!');
    console.log('\n📝 You can now log in with:');
    console.log('   Regular User: test@example.com / password123');
    console.log('   DJ User: testdj@example.com / djpass123');
    
  } catch (error) {
    console.error('❌ Failed to create test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 