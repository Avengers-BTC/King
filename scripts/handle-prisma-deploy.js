// scripts/handle-prisma-deploy.js
const { execSync } = require('child_process');

// Only run migrations on Vercel production environment
if (process.env.VERCEL === '1') {
  console.log('📦 Running database migrations in Vercel environment...');
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Database migrations completed successfully!');
  } catch (error) {
    console.error('❌ Error during database migration:', error);
    process.exit(1);
  }
} else {
  console.log('🔄 Skipping database migrations in local/development environment.');
}
