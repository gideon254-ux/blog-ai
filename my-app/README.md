# BlogAI - AI-Powered Blog Autogeneration App

A complete, production-ready AI-powered blog post autogeneration web application built with Next.js 14, TypeScript, and deployed on Vercel.

## Features

- **AI Blog Generation**: Generate high-quality blog posts using Claude AI
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
- **AI**: Anthropic Claude API
- **Rich Text Editor**: TipTap
- **Hosting**: Vercel (Free Tier)
- **Background Jobs**: Vercel Cron (every 5 minutes)

## Project Structure

```
/app
├── api/                    # API routes
│   ├── auth/              # Authentication endpoints
│   ├── crons/             # Background job processing
│   ├── ai/                # AI helper endpoints
│   └── posts/             # Post CRUD endpoints
├── auth/                  # Login/Register pages
├── dashboard/             # User dashboard
├── generate/              # Topic input & progress pages
├── editor/                # Editor, SEO, Review, Success pages
├── posts/                 # Post listing & public post pages
├── layout.tsx             # Root layout
├── page.tsx               # Landing page
└── providers.tsx          # Context providers
/lib
├── prisma.ts              # Database client
├── auth.ts                # Password hashing utilities
├── next-auth.ts           # Auth configuration
└── ai.ts                  # AI service functions
/prisma
└── schema.prisma          # Database schema
```

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

# AI API
ANTHROPIC_API_KEY=sk-ant-...

# Vercel Cron
CRON_SECRET=your-cron-secret-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (for development)
npx prisma db push

# Or run migrations
npx prisma migrate dev --name init
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
4. Add to Vercel environment variables

### 2. Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Deploy!

### 3. Configure Cron Job

The `vercel.json` file already includes the cron configuration:

```json
{
  "crons": [{
    "path": "/api/crons/process-generation",
    "schedule": "*/5 * * * *"
  }]
}
```

### 4. Setup Anthropic API

1. Get an API key from https://console.anthropic.com/
2. Add `ANTHROPIC_API_KEY` to Vercel environment variables

## How It Works

### Blog Generation Flow

1. User enters topic and clicks "Generate"
2. API creates a job in `generation_jobs` table with status `queued`
3. Cron job runs every 5 minutes and processes queued jobs
4. AI generates content and saves to database
5. Frontend polls for status updates every 2 seconds
6. When complete, user is redirected to the editor

### Key Features

- **Queue Pattern**: Bypasses Vercel's 12-second function timeout
- **Real-time Updates**: Progress bar shows generation status
- **Auto-save**: Editor auto-saves every 30 seconds
- **SEO Scoring**: Real-time SEO optimization feedback
- **Rate Limiting**: 5 posts per day on free tier

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login (handled by NextAuth)

### Generation
- `POST /api/generate` - Queue new generation job
- `GET /api/status?jobId=xxx` - Check job status
- `POST /api/crons/process-generation` - Process jobs (cron)

### Posts
- `GET /api/posts` - List user's posts
- `POST /api/posts/[id]/content` - Save content
- `POST /api/posts/[id]/metadata` - Save SEO metadata
- `POST /api/posts/[id]/publish` - Publish post
- `POST /api/posts/[id]/schedule` - Schedule post

### AI Helpers
- `POST /api/ai/rewrite` - Rewrite/expand/shorten text
- `POST /api/ai/extract-keywords` - Extract SEO keywords

## Database Schema

See `prisma/schema.prisma` for full schema.

Key tables:
- `users` - User accounts
- `generation_jobs` - AI generation queue
- `blog_posts` - Published/draft posts
- `sessions` - Authentication sessions

## Troubleshooting

### Build Errors
```bash
# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next
```

### Database Connection
- Verify DATABASE_URL format
- Check Supabase connection pooling settings
- Ensure IP allowlist includes Vercel IPs

### AI Generation Not Working
- Verify ANTHROPIC_API_KEY is set
- Check Vercel logs for errors
- Ensure cron job is configured

## License

MIT

## Support

For issues and feature requests, please use GitHub issues.