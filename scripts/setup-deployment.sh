#!/bin/bash
# scripts/setup-deployment.sh

set -e

echo "🚀 Starting Multiverse AI Builder Deployment..."

# Check Node version
if ! node --version | grep -q "v18"; then
    echo "❌ Node.js 18 is required. Please install it first."
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found. Please check your repository structure."
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build frontend
echo "🏗️ Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Frontend build failed - dist directory not created"
    exit 1
fi

echo "✅ Frontend build successful!"
echo "📁 Build output: frontend/dist"

# Check Netlify configuration
if [ ! -f "netlify.toml" ]; then
    echo "❌ netlify.toml not found in frontend directory"
    exit 1
fi

echo "🎉 Deployment setup completed successfully!"
echo "📋 Next steps:"
echo "   1. Connect your repository to Netlify"
echo "   2. Set build command to: cd frontend && npm run build"
echo "   3. Set publish directory to: frontend/dist"
echo "   4. Add environment variables in Netlify dashboard"
