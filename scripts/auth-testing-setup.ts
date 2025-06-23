// auth-testing-setup.ts
// Script to reset the database and create test users for authentication testing

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAndSeedForAuthTesting() {
  try {
    console.log('🧹 Starting database reset for auth testing...');

    // Reset all tables related to authentication
    await prisma.session.deleteMany();
    console.log('✅ Deleted all sessions');

    await prisma.verificationToken.deleteMany();
    console.log('✅ Deleted all verification tokens');
    
    await prisma.account.deleteMany();
    console.log('✅ Deleted all accounts');

    await prisma.user.deleteMany();
    console.log('✅ Deleted all users');

    // Create test users for authentication
    console.log('🌱 Creating test users...');
    
    // 1. Regular user
    const regularUser = await prisma.user.create({
      data: {
        email: 'user@test.com',
        name: 'Regular User',
        username: 'regular_user',
        password: await bcrypt.hash('password123', 12),
        role: 'USER',
        location: 'Nairobi, Kenya',
        bio: 'I am a regular user for testing'
      }
    });
    console.log('✅ Created regular user:', regularUser.email);

    // 2. DJ user
    const djUser = await prisma.user.create({
      data: {
        email: 'dj@test.com',
        name: 'Test DJ',
        username: 'test_dj',
        password: await bcrypt.hash('password123', 12),
        role: 'DJ',
        location: 'Nairobi, Kenya',
        bio: 'I am a DJ user for testing'
      }
    });
    console.log('✅ Created DJ user:', djUser.email);
    
    // 3. Admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Test Admin',
        username: 'test_admin',
        password: await bcrypt.hash('password123', 12),
        role: 'ADMIN',
        location: 'Nairobi, Kenya',
        bio: 'I am an admin user for testing'
      }
    });
    console.log('✅ Created admin user:', adminUser.email);

    console.log('🎉 Auth testing setup completed successfully!');
    console.log('\nTest credentials:');
    console.log('👤 Regular user: user@test.com / password123');
    console.log('🎧 DJ user: dj@test.com / password123');
    console.log('🛠️ Admin user: admin@test.com / password123');
    
  } catch (error) {
    console.error('❌ Error during auth testing setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset and seed function
resetAndSeedForAuthTesting();
