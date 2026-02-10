import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/next-auth'
import { rewriteText } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, instruction, tone } = await req.json()

    if (!text || !instruction) {
      return NextResponse.json(
        { error: 'Text and instruction required' },
        { status: 400 }
      )
    }

    let prompt = instruction
    if (instruction === 'rewrite') prompt = 'Rewrite this text to be more engaging while keeping the same meaning'
    if (instruction === 'expand') prompt = 'Expand on this text with more detail and examples'
    if (instruction === 'shorten') prompt = 'Make this text more concise without losing key information'
    if (instruction === 'simplify') prompt = 'Simplify this text to make it easier to understand'

    const rewrittenText = await rewriteText(text, prompt, tone || 'professional')

    return NextResponse.json({
      originalText: text,
      rewrittenText,
      improvements: 'Text successfully processed'
    })
  } catch (error) {
    console.error('Rewrite error:', error)
    return NextResponse.json(
      { error: 'Failed to process text' },
      { status: 500 }
    )
  }
}