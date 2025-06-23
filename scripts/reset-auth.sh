#!/bin/bash
# Script to run the auth testing setup

echo "📋 Running database reset and seeding for auth testing..."

npx ts-node scripts/auth-testing-setup.ts

echo "✨ Done! You can now test authentication with the following accounts:"
echo "👤 Regular user: user@test.com / password123"
echo "🎧 DJ user: dj@test.com / password123"
echo "🛠️ Admin user: admin@test.com / password123"
