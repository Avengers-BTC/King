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

// Validate DATABASE_URL format
const databaseUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL type:', typeof databaseUrl);
console.log('DATABASE_URL length:', databaseUrl.length);
console.log('DATABASE_URL first 10 chars:', databaseUrl.substring(0, 10));
console.log('DATABASE_URL starts with postgresql://', databaseUrl.startsWith('postgresql://'));
console.log('DATABASE_URL starts with postgres://', databaseUrl.startsWith('postgres://'));

// Check for common issues
if (databaseUrl.startsWith('"') || databaseUrl.startsWith("'")) {
  console.error('❌ ERROR: DATABASE_URL contains quotes! Removing them...');
  process.env.DATABASE_URL = databaseUrl.replace(/^['"]|['"]$/g, '');
  console.log('Fixed DATABASE_URL:', process.env.DATABASE_URL);
}

if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
  console.error('❌ ERROR: DATABASE_URL does not start with postgresql:// or postgres://');
  console.log('Current DATABASE_URL:', process.env.DATABASE_URL);
  console.log('Please update your DATABASE_URL to start with postgresql:// or postgres://');
  console.log('Example: postgresql://username:password@host:port/database');
  process.exit(1);
}

// Only run migrations on Vercel production environment
if (process.env.VERCEL === '1') {
  console.log('📦 Running database migrations in Vercel environment...');
  try {
    // Print first few characters of DATABASE_URL to verify it exists (hide sensitive info)
    const dbUrlPreview = process.env.DATABASE_URL.substring(0, 15) + '...';
    console.log(`Using database URL: ${dbUrlPreview}`);
    
    // Set environment variable to disable Prisma Data Proxy
    process.env.PRISMA_GENERATE_DATAPROXY = 'false';
    
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        PRISMA_GENERATE_DATAPROXY: 'false'
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
