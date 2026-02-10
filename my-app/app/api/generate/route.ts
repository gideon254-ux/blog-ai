import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { topic, tone, contentType, lengthPreference, targetAudience, sectionsToInclude } = body

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const postsToday = await prisma.generationJob.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: today }
      }
    })

    if (postsToday >= 5) {
      return NextResponse.json(
        { error: 'Daily limit reached. Free tier allows 5 posts per day.' },
        { status: 429 }
      )
    }

    const job = await prisma.generationJob.create({
      data: {
        userId: session.user.id,
        topic: topic.trim(),
        tone: tone || 'professional',
        contentType: contentType || 'blog_post',
        lengthPreference: lengthPreference || 'medium',
        targetAudience: targetAudience || 'beginners',
        sectionsToInclude: sectionsToInclude || 'introduction,conclusion',
        status: 'queued'
      }
    })

    return NextResponse.json({
      jobId: job.id,
      status: 'queued',
      estimatedTime: 60
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}