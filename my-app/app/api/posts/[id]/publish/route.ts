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
        status: 'published',
        publishedAt: new Date()
      }
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalPostsGenerated: {
          increment: 1
        }
      }
    })

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL}/posts/${updatedPost.slug}`

    return NextResponse.json({
      postId: updatedPost.id,
      status: 'published',
      publishedAt: updatedPost.publishedAt,
      publicUrl,
      message: 'Post published successfully'
    })
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}