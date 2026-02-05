#!/bin/bash

echo "🚀 Quest Foundation Platform - Quick Start Setup"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo ""
    echo "Please create a .env file with the following variables:"
    echo ""
    echo "DATABASE_URL=\"postgresql://user:password@localhost:5432/quest_foundation\""
    echo "NEXTAUTH_SECRET=\"$(openssl rand -base64 32)\""
    echo "NEXTAUTH_URL=\"http://localhost:3000\""
    echo ""
    echo "You can copy from env.example:"
    echo "  cp env.example .env"
    echo ""
    exit 1
fi

echo "✅ .env file found"
echo ""

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

echo ""
echo "🗃️  Setting up database..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma generate failed!"
    exit 1
fi

npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "❌ Prisma migrate failed!"
    echo ""
    echo "Make sure your DATABASE_URL is correct and PostgreSQL is running."
    exit 1
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "================================================"
echo "🎉 Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open http://localhost:3000 in your browser"
echo ""
echo "3. Register a new account"
echo ""
echo "4. Make the first user an admin by running:"
echo "   UPDATE \"User\" SET status = 'APPROVED', role = 'ADMIN'"
echo "   WHERE email = 'your-email@example.com';"
echo ""
echo "5. Login with your admin account"
echo ""
echo "================================================"
