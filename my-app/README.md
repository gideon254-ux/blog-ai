# BlogAI - AI-Powered Blog Autogeneration App

A complete, production-ready AI-powered blog post autogeneration web application built with Next.js 14, TypeScript, and deployed on Vercel.

## Features

- **AI Blog Generation**: Generate high-quality blog posts using Google Gemini
- **Background Job Queue**: Handles long-running AI generation without Vercel timeout limits
- **Rich Text Editor**: Full-featured editor with TipTap for content editing
- **SEO Optimization**: Built-in SEO tools with real-time scoring
- **One-Click Publishing**: Publish instantly or schedule for later
- **User Authentication**: Secure login/register with NextAuth.js
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **AI**: Google Gemini Pro API
- **Rich Text Editor**: TipTap
- **Hosting**: Vercel (Free Tier)
- **Background Jobs**: Vercel Cron

## Quick Start

### 1. Clone and Install

```bash
cd blog-ai-app/my-app
npm install
```

### 2. Environment Variables

Create `.env.local`:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
DIRECT_URL=postgresql://user:password@db.supabase.co:5432/postgres

# Authentication
NEXTAUTH_SECRET=your-random-secret-key-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# AI API - Google Gemini
GOOGLE_GEMINI_API_KEY=AIza...

# Vercel Cron
CRON_SECRET=your-cron-secret-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment

### 1. Setup Supabase

1. Create a free Supabase account
2. Create a new PostgreSQL project
3. Get the connection string from Settings > Database

### 2. Setup Google Gemini

1. Go to https://aistudio.google.com/
2. Create a free API key
3. Add to Vercel environment variables

### 3. Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## How It Works

1. User enters topic and clicks "Generate"
2. API creates a job in `generation_jobs` table with status `queued`
3. Cron job processes queued jobs
4. AI generates content and saves to database
5. Frontend polls for status updates
6. When complete, user is redirected to the editor

## Key Features

- **Queue Pattern**: Bypasses Vercel's 12-second function timeout
- **Real-time Updates**: Progress bar shows generation status
- **Auto-save**: Editor auto-saves every 30 seconds
- **SEO Scoring**: Real-time SEO optimization feedback

## Troubleshooting

### AI Generation Not Working
- Verify GOOGLE_GEMINI_API_KEY is set
- Check Vercel logs for errors
- Ensure cron job is configured

### Database Connection
- Verify DATABASE_URL format
- Check Supabase connection pooling settings

## License

MIT