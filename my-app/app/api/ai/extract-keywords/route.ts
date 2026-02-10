import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth'
import { extractKeywords } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, count = 5 } = await req.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const keywords = await extractKeywords(content, count)

    return NextResponse.json({ keywords })
  } catch (error) {
    console.error('Extract keywords error:', error)
    return NextResponse.json(
      { error: 'Failed to extract keywords' },
      { status: 500 }
    )
  }
}