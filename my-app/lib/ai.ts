import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

function getModel() {
  return genAI.getGenerativeModel({ model: 'gemini-pro' })
}

function getLengthTokens(lengthPreference: string): number {
  const tokenMap: Record<string, number> = {
    short: 1500,
    medium: 3000,
    long: 6000
  }
  return tokenMap[lengthPreference] || 3000
}

export async function generateBlogPost(params: {
  topic: string
  tone: string
  contentType: string
  lengthPreference: string
  targetAudience?: string
  sectionsToInclude?: string
}): Promise<string> {
  const {
    topic,
    tone,
    contentType,
    lengthPreference,
    targetAudience = 'beginners',
    sectionsToInclude = 'introduction,conclusion'
  } = params

  const lengthMap: Record<string, string> = {
    short: '300-500 words',
    medium: '800-1200 words',
    long: '2000+ words'
  }

  const sections = sectionsToInclude.split(',').map(s => s.trim())
  
  const prompt = `You are an expert content writer. Write a ${contentType.replace(/_/g, ' ')} about "${topic}".
  
Tone: ${tone}
Target audience: ${targetAudience}
Length: ${lengthMap[lengthPreference] || '800-1200 words'}

Requirements:
- Write in markdown format
- Use proper headings (H1 for title, H2 for sections)
- Start directly with the content, no introductions

${sections.includes('introduction') ? '- Include an engaging introduction' : ''}
${sections.includes('bullet_points') ? '- Use bullet points where appropriate' : ''}
${sections.includes('conclusion') ? '- End with a strong conclusion' : ''}
${sections.includes('call_to_action') ? '- Include a call-to-action' : ''}
${sections.includes('faq_section') ? '- Add a FAQ section at the end' : ''}

Make the content engaging, informative, and well-structured. Use examples where appropriate.`

  try {
    const model = getModel()
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: getLengthTokens(lengthPreference),
        temperature: 0.7
      }
    })

    const response = result.response
    const text = response.text()
    
    if (!text) {
      throw new Error('Empty response from AI')
    }
    
    return text
  } catch (error) {
    console.error('AI generation error:', error)
    throw error
  }
}

export async function rewriteText(text: string, instruction: string, tone: string): Promise<string> {
  const prompts: Record<string, string> = {
    rewrite: 'Rewrite this text to be more engaging while keeping the same meaning',
    expand: 'Expand on this text with more detail and examples',
    shorten: 'Make this text more concise without losing key information',
    simplify: 'Simplify this text to make it easier to understand'
  }

  const prompt = `${prompts[instruction] || instruction}

Tone: ${tone}

Text to rewrite:
${text}

Provide only the rewritten text, no explanations or markdown.`

  try {
    const model = getModel()
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7
      }
    })

    const response = result.response
    const rewritten = response.text()
    
    if (!rewritten) {
      throw new Error('Empty response from AI')
    }
    
    return rewritten
  } catch (error) {
    console.error('Rewrite error:', error)
    throw error
  }
}

export async function extractKeywords(content: string, count: number = 5): Promise<string[]> {
  const prompt = `Extract the top ${count} most relevant SEO keywords from the following content. Return only a comma-separated list of keywords, nothing else, no markdown.

Content:
${content.substring(0, 2000)}`

  try {
    const model = getModel()
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.3
      }
    })

    const response = result.response
    const text = response.text()
    
    return text
      .split(',')
      .map(k => k.trim().replace(/^\*|\*$/g, ''))
      .filter(k => k.length > 0)
  } catch (error) {
    console.error('Keyword extraction error:', error)
    return []
  }
}