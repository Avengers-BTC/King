// scripts/debug-prisma.js
const { PrismaClient } = require('@prisma/client');

console.log('=== PRISMA DEBUG SCRIPT ===');

// Log database URL details without exposing credentials
const databaseUrl = process.env.DATABASE_URL || 'not set';
console.log('DATABASE_URL type:', typeof databaseUrl);
console.log('DATABASE_URL length:', databaseUrl.length);
if (databaseUrl !== 'not set') {
  console.log('DATABASE_URL first 15 chars:', databaseUrl.substring(0, 15) + '...');
  console.log('DATABASE_URL starts with postgresql://', databaseUrl.startsWith('postgresql://'));
  console.log('DATABASE_URL starts with postgres://', databaseUrl.startsWith('postgres://'));
  
  // Check for common issues
  if (databaseUrl.startsWith('"') || databaseUrl.startsWith("'")) {
    console.error('❌ ERROR: DATABASE_URL contains quotes!');
  }
  
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    console.error('❌ ERROR: DATABASE_URL does not start with postgresql:// or postgres://');
  }
}

try {
  console.log('Attempting to initialize PrismaClient...');
  const prisma = new PrismaClient();
  console.log('PrismaClient initialized successfully!');
  
  console.log('Attempting to connect to the database...');
  prisma.$connect()
    .then(() => {
      console.log('✅ Successfully connected to the database!');
      return prisma.$disconnect();
    })
    .catch(error => {
      console.error('❌ Error connecting to the database:', error);
    })
    .finally(() => {
      console.log('=== DEBUG SCRIPT COMPLETE ===');
    });
} catch (error) {
  console.error('❌ Error initializing PrismaClient:', error);
  console.log('=== DEBUG SCRIPT COMPLETE WITH ERRORS ===');
}
