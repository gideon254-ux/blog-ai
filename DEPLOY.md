# GitHub & Vercel Deployment Guide

## Step 1: Push to GitHub

```bash
cd /home/olivertwist/postpilot/blog-ai-app

# Create repository on GitHub.com first:
# 1. Go to https://github.com/new
# 2. Repository name: blog-ai
# 3. Make it Public
# 4. Don't initialize with README

# Then push:
git remote add origin https://github.com/gideon254-ux/blog-ai.git
git push -u origin main
```

## Step 2: Deploy on Vercel

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your "blog-ai" GitHub repository
4. Click "Deploy"

## Step 3: Add Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

| Name | Value |
|------|-------|
| DATABASE_URL | postgresql://... (from Supabase) |
| DIRECT_URL | postgresql://... (from Supabase) |
| GOOGLE_GEMINI_API_KEY | AIza... (from Google AI Studio) |
| NEXTAUTH_SECRET | openssl rand -base64 32 |
| NEXTAUTH_URL | https://your-app.vercel.app |
| NEXT_PUBLIC_APP_URL | https://your-app.vercel.app |
| CRON_SECRET | any random string |

## Step 4: Setup Database

1. Create free account at https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy DATABASE_URL and DIRECT_URL to Vercel
5. Run: `npx prisma db push` (or use Supabase SQL editor)

## Step 5: Setup AI (Google Gemini)

1. Go to https://aistudio.google.com/
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the API key
5. Add `GOOGLE_GEMINI_API_KEY` to Vercel

## Done! 🎉

Your BlogAI app is now live at https://your-app.vercel.app

---

## Important Notes

- **Cron Jobs**: Free tier only runs once/day at midnight. Upgrade to Pro for hourly.
- **Database**: Uses Supabase free tier
- **AI**: Uses Google Gemini Pro (generous free tier available)