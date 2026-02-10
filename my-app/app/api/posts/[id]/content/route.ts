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

    const { title, content } = await req.json()

    const post = await prisma.blogPost.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length
    const readingTimeMinutes = Math.ceil(wordCount / 200)

    const updatedPost = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        title: title || post.title,
        content,
        wordCount,
        readingTimeMinutes
      }
    })

    return NextResponse.json({
      postId: updatedPost.id,
      wordCount,
      readingTimeMinutes,
      message: 'Content saved successfully'
    })
  } catch (error) {
    console.error('Save content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}