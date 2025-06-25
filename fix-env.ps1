# Fix Environment Variables Script
Write-Host "🔧 Fixing environment variables..." -ForegroundColor Yellow

# Read current .env.development.local
$envFile = ".env.development.local"
$envContent = Get-Content $envFile -Raw

Write-Host "📝 Current environment variables:" -ForegroundColor Cyan
Write-Host $envContent

Write-Host "`n🚨 Issues found:" -ForegroundColor Red
Write-Host "1. DATABASE_URL has line breaks"
Write-Host "2. Missing NEXT_PUBLIC_SOCKET_SERVER"

Write-Host "`n✅ Required fixes:" -ForegroundColor Green
Write-Host "1. Fix DATABASE_URL (remove line breaks)"
Write-Host "2. Add NEXT_PUBLIC_SOCKET_SERVER=https://king-w38u.onrender.com"

Write-Host "`n📋 Here's the corrected content for .env.development.local:" -ForegroundColor Yellow
Write-Host "============================================="

$correctedContent = @"
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_SERVER=https://king-w38u.onrender.com
NEXTAUTH_DEBUG=true
DATABASE_URL="postgresql://neondb_owner:npg_UKj4lGtk1rxq@ep-cold-sunset-a2z735vq-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET=aCpUXE3bTMI3hMNz5ngEZqaCxiDveEoBXiej2HPAex8=
"@

Write-Host $correctedContent -ForegroundColor Green
Write-Host "============================================="

Write-Host "`n🔧 To apply these fixes manually:" -ForegroundColor Cyan
Write-Host "1. Copy the content above"
Write-Host "2. Open .env.development.local in your editor" 
Write-Host "3. Replace all content with the corrected version"
Write-Host "4. Save the file"
Write-Host "5. Restart the development server (npm run dev)"

Write-Host "`n📚 Test credentials created:" -ForegroundColor Magenta
Write-Host "Regular User: test@example.com / password123"
Write-Host "DJ User: testdj@example.com / djpass123"

Write-Host "`n🚀 After fixing, the chat should work properly!" -ForegroundColor Green 