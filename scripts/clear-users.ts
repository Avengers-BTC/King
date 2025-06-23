import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearUsers() {
  try {
    // Delete all users
    const deleteUsers = await prisma.user.deleteMany({});
    console.log('Cleared users:', deleteUsers.count);

    // Delete any related records if needed
    // Add more deleteMany operations here if you have related tables

    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearUsers();
