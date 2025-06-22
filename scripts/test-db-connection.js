// scripts/test-db-connection.js
const { PrismaClient } = require('@prisma/client');

// Load environment variables from .env.test file
require('dotenv').config({ path: '.env.test' });

// Print DATABASE_URL info for debugging
const dbUrl = process.env.DATABASE_URL || 'not set';
console.log('DATABASE_URL starts with:', dbUrl.substring(0, 10) + '...');
console.log('DATABASE_URL length:', dbUrl.length);

try {
  console.log('Creating Prisma client...');
  const prisma = new PrismaClient();
  
  console.log('Connecting to the database...');
  prisma.$connect()
    .then(async () => {
      console.log('✅ Connected to the database successfully!');
      
      // Try a simple query
      console.log('Attempting to query the database...');
      const userCount = await prisma.user.count();
      console.log(`There are ${userCount} users in the database.`);
      
      await prisma.$disconnect();
      console.log('Disconnected from the database.');
    })
    .catch(error => {
      console.error('❌ Failed to connect to the database:', error);
    });
} catch (error) {
  console.error('❌ Error creating Prisma client:', error);
}
