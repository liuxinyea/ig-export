#!/bin/bash

# LeadFlow Website Deployment Script

echo "🚀 Starting LeadFlow Website deployment..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub remote:"
    echo "   git remote add origin https://github.com/yourusername/igexport-website.git"
    echo "   Then run this script again."
    exit 1
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Update $(date +%Y-%m-%d_%H-%M-%S)"
git push origin main

echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Import your GitHub repository"
echo "3. Vercel will automatically deploy your site"
echo "4. Add custom domain: igexport.auraflame.tech"
echo ""
echo "📝 Don't forget to:"
echo "1. Update Chrome Web Store extension ID in page.tsx"
echo "2. Replace YOUR_EXTENSION_ID with actual ID"
echo "3. Add Google Analytics tracking code"
echo "4. Set up email forwarding for @auraflame.tech"
