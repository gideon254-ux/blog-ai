import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scheduledAt } = await req.json()

    const scheduledDate = new Date(scheduledAt)
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    const post = await prisma.blogPost.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        status: 'scheduled',
        scheduledAt: scheduledDate
      }
    })

    return NextResponse.json({
      postId: updatedPost.id,
      status: 'scheduled',
      scheduledAt: updatedPost.scheduledAt,
      message: 'Post scheduled successfully'
    })
  } catch (error) {
    console.error('Schedule error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}