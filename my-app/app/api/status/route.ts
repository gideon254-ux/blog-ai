import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    const job = await prisma.generationJob.findFirst({
      where: {
        id: jobId,
        userId: session.user.id
      }
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    let progress = 0
    if (job.status === 'queued') progress = 5
    else if (job.status === 'generating') {
      const elapsed = job.processingStartedAt 
        ? Date.now() - new Date(job.processingStartedAt).getTime()
        : 0
      progress = Math.min(90, Math.floor(elapsed / 1000) * 15)
    }
    else if (job.status === 'completed') progress = 100

    const response: any = {
      status: job.status,
      progress,
      topic: job.topic,
      tone: job.tone,
      lengthPreference: job.lengthPreference
    }

    if (job.status === 'completed') {
      response.result = job.result
    } else if (job.status === 'failed') {
      response.error = job.errorMessage
    } else if (job.status === 'generating' && job.result) {
      response.partialContent = job.result
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}