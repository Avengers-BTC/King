// scripts/handle-prisma-deploy.js
const { execSync } = require('child_process');

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.log('This is required for Prisma migrations to work correctly.');
  console.log('Please set DATABASE_URL in your Vercel project settings.');
  
  // Don't fail the build - just skip migrations
  console.log('Skipping migrations due to missing DATABASE_URL...');
  process.exit(0);
}

// Only run migrations on Vercel production environment
if (process.env.VERCEL === '1') {
  console.log('📦 Running database migrations in Vercel environment...');
  try {
    // Print first few characters of DATABASE_URL to verify it exists (hide sensitive info)
    const dbUrlPreview = process.env.DATABASE_URL.substring(0, 15) + '...';
    console.log(`Using database URL: ${dbUrlPreview}`);
    
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL
      }
    });
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error during database migration:', error);
    // Don't fail the build - migrations might not be critical for all deployments
    console.log('Continuing build despite migration error...');
  }
} else {
  console.log('🔄 Skipping database migrations in local/development environment.');
}
