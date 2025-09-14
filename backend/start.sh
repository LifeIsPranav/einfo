#!/bin/sh

echo "🚀 Starting E-Info Backend..."

# Set OpenSSL environment variables for Prisma
export OPENSSL_CONF=/dev/null

echo "📦 Running database setup..."
npx prisma db push --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully"
else
    echo "❌ Database setup failed"
    exit 1
fi

echo "🌟 Starting application..."
npm start
