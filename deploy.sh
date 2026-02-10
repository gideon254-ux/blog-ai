#!/bin/bash

# BlogAI Deployment Script
# Run this to push to GitHub and get deployment link

echo "🚀 BlogAI Deployment Script"
echo ""

cd "$(dirname \"$0\")\"

if ! command -v gh &> /dev/null; then
    echo \"❌ GitHub CLI (gh) not found.\"
    echo \"Please install it: https://cli.github.com/\"
    echo \"\"
    echo \"Alternative - Manual steps:\"
    echo \"1. Create repo at https://github.com/new (name: blog-ai)\"
    echo \"2. Run: git remote add origin https://github.com/gideon254-ux/blog-ai.git\"
    echo \"3. Run: git push -u origin main\"
    echo \"4. Go to https://vercel.com and import the repo\"
    exit 1
fi

echo \"📦 Creating GitHub repository...\"
gh repo create blog-ai --public --source=. --description \"AI-Powered Blog Autogeneration App with Next.js 14\"

echo \"\"
echo \"🔄 Pushing to GitHub...\"
git push -u origin main

echo \"\"
echo \"✅ Deployed to GitHub!\"
echo \"\"
echo \"📋 Next steps:\"
echo \"1. Go to https://vercel.com\"
echo \"2. Import the 'blog-ai' repository\"
echo \"3. Add these environment variables in Vercel:\"
echo \"   - DATABASE_URL (Supabase connection string)\"
echo \"   - ANTHROPIC_API_KEY (from Anthropic Console)\"
echo \"   - NEXTAUTH_SECRET (generate: openssl rand -base64 32)\"
echo \"   - NEXTAUTH_URL (your Vercel domain)\"
echo \"   - NEXT_PUBLIC_APP_URL (same as NEXTAUTH_URL)\"
echo \"\"
echo \"🎉 Your app will be live!\"
