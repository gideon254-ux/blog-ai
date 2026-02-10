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

    const body = await req.json()
    const { title, metaDescription, keywords, category, featuredImageUrl, slug, authorName } = body

    const post = await prisma.blogPost.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 60)
    const uniqueSlug = `${finalSlug}-${Date.now()}`

    const updatedPost = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        title: title || post.title,
        slug: uniqueSlug,
        metaDescription: metaDescription || null,
        keywords: keywords || null,
        category: category || null,
        featuredImageUrl: featuredImageUrl || null,
        authorName: authorName || null
      }
    })

    return NextResponse.json({
      postId: updatedPost.id,
      message: 'Metadata saved successfully'
    })
  } catch (error) {
    console.error('Save metadata error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}