import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateBlogPost } from '@/lib/ai'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const jobs = await prisma.generationJob.findMany({
      where: { status: 'queued' },
      orderBy: { createdAt: 'asc' },
      take: 3
    })

    const results = []

    for (const job of jobs) {
      try {
        await prisma.generationJob.update({
          where: { id: job.id },
          data: {
            status: 'generating',
            processingStartedAt: new Date()
          }
        })

        const content = await generateBlogPost({
          topic: job.topic,
          tone: job.tone,
          contentType: job.contentType,
          lengthPreference: job.lengthPreference,
          targetAudience: job.targetAudience || undefined,
          sectionsToInclude: job.sectionsToInclude || undefined
        })

        await prisma.generationJob.update({
          where: { id: job.id },
          data: {
            status: 'completed',
            result: content,
            completedAt: new Date()
          }
        })

        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : job.topic
        
        const slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 60)

        const wordCount = content.split(/\s+/).length
        const readingTimeMinutes = Math.ceil(wordCount / 200)

        await prisma.blogPost.create({
          data: {
            userId: job.userId,
            jobId: job.id,
            title: title.substring(0, 255),
            slug: `${slug}-${Date.now()}`,
            content,
            excerpt: content.substring(0, 200).replace(/[#*]/g, ''),
            status: 'draft',
            wordCount,
            readingTimeMinutes
          }
        })

        results.push({ jobId: job.id, status: 'completed' })
      } catch (error: any) {
        console.error(`Job ${job.id} failed:`, error)
        
        await prisma.generationJob.update({
          where: { id: job.id },
          data: {
            status: 'failed',
            errorMessage: error.message || 'Unknown error'
          }
        })

        results.push({ jobId: job.id, status: 'failed', error: error.message })
      }
    }

    return NextResponse.json({
      processed: jobs.length,
      results
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}