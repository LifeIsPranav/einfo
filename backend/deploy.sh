#!/bin/bash

# Render Deployment Script for E-Info Backend

echo "🚀 Starting E-Info Backend Deployment to Render..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the backend directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "📊 Running database migrations..."
npx prisma migrate deploy

echo "✅ Deployment preparation complete!"
echo ""
echo "🔗 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your GitHub repo to Render"
echo "3. Set the following environment variables in Render:"
echo "   - DATABASE_URL (your PostgreSQL connection string)"
echo "   - JWT_SECRET (a secure secret key)"
echo "   - CORS_ORIGINS (your frontend URLs)"
echo "   - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET (for OAuth)"
echo "   - CLOUDINARY_* variables (for image uploads)"
echo "   - SMTP_* variables (for email functionality)"
echo ""
echo "4. Deploy using the render.yaml file in this directory"
