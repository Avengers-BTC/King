// scripts/vercel-startup.js
// This script is meant to be executed during Vercel deployment
// to verify the DATABASE_URL environment variable

console.log('===== VERCEL ENVIRONMENT VERIFICATION =====');

// Check DATABASE_URL
const dbUrl = process.env.DATABASE_URL || 'not set';
console.log('DATABASE_URL type:', typeof dbUrl);
console.log('DATABASE_URL length:', dbUrl.length);
console.log('DATABASE_URL starts with:', dbUrl.substring(0, 10) + '...');
console.log('DATABASE_URL protocol check:', 
  dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') 
  ? '✅ Valid protocol' 
  : '❌ Invalid protocol'
);

// Check for quotes in the string
if (dbUrl.startsWith('"') || dbUrl.endsWith('"') || dbUrl.startsWith("'") || dbUrl.endsWith("'")) {
  console.log('❌ ERROR: DATABASE_URL contains quotes!');
  console.log('Removing quotes and setting DATABASE_URL to:', dbUrl.replace(/^['"]|['"]$/g, ''));
  process.env.DATABASE_URL = dbUrl.replace(/^['"]|['"]$/g, '');
} else {
  console.log('✅ No quotes found in DATABASE_URL');
}

// Create a file to add to package.json's build script
console.log('===== END ENVIRONMENT VERIFICATION =====');
