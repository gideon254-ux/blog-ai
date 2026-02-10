import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

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
  
  let systemPrompt = `You are an expert content writer. Write a ${contentType.replace(/_/g, ' ')} about "${topic}".`
  systemPrompt += `\n\nTone: ${tone}`
  systemPrompt += `\nTarget audience: ${targetAudience}`
  systemPrompt += `\nLength: ${lengthMap[lengthPreference] || '800-1200 words'}`
  systemPrompt += `\n\nRequirements:`
  systemPrompt += `\n- Write in markdown format`
  systemPrompt += `\n- Use proper headings (H1 for title, H2 for sections)`
  
  if (sections.includes('introduction')) {
    systemPrompt += `\n- Include an engaging introduction`
  }
  if (sections.includes('bullet_points')) {
    systemPrompt += `\n- Use bullet points where appropriate`
  }
  if (sections.includes('conclusion')) {
    systemPrompt += `\n- End with a strong conclusion`
  }
  if (sections.includes('call_to_action')) {
    systemPrompt += `\n- Include a call-to-action`
  }
  if (sections.includes('faq_section')) {
    systemPrompt += `\n- Add a FAQ section at the end`
  }

  systemPrompt += `\n\nMake the content engaging, informative, and well-structured. Use examples where appropriate.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Write a comprehensive blog post about: ${topic}`
        }
      ]
    })

    const content = response.content[0]
    if (content.type === 'text') {
      return content.text
    }
    
    throw new Error('Unexpected response format from AI')
  } catch (error) {
    console.error('AI generation error:', error)
    throw error
  }
}

export async function rewriteText(text: string, instruction: string, tone: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2048,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: `Rewrite the following text with these instructions: ${instruction}

Tone: ${tone}

Text to rewrite:
${text}

Provide only the rewritten text, no explanations.`
        }
      ]
    })

    const content = response.content[0]
    if (content.type === 'text') {
      return content.text
    }
    
    throw new Error('Unexpected response format')
  } catch (error) {
    console.error('Rewrite error:', error)
    throw error
  }
}

export async function extractKeywords(content: string, count: number = 5): Promise<string[]> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 512,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: `Extract the top ${count} most relevant SEO keywords from the following content. Return only a comma-separated list of keywords, nothing else.

Content:
${content.substring(0, 2000)}`
        }
      ]
    })

    const responseContent = response.content[0]
    if (responseContent.type === 'text') {
      return responseContent.text.split(',').map(k => k.trim()).filter(k => k.length > 0)
    }
    
    return []
  } catch (error) {
    console.error('Keyword extraction error:', error)
    return []
  }
}