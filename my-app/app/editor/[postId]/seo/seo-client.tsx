'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, AlertTriangle, X } from 'lucide-react'
import { extractKeywords } from '@/lib/ai'

interface SeoClientProps {
  post: {
    id: string
    title: string
    slug: string
    metaDescription?: string | null
    keywords?: string | null
    category?: string | null
    featuredImageUrl?: string | null
    excerpt?: string | null
    content: string
    authorName?: string | null
    readingTimeMinutes?: number | null
  }
}

function calculateSeoScore(data: {
  title: string
  metaDescription: string
  keywords: string[]
  hasH1: boolean
  readingTime: number
}): number {
  let score = 0
  
  if (data.title.length >= 30 && data.title.length <= 60) score += 20
  else if (data.title.length > 0) score += 10
  
  if (data.metaDescription.length >= 120 && data.metaDescription.length <= 160) score += 20
  else if (data.metaDescription.length > 0) score += 10
  
  if (data.keywords.length >= 3) score += 20
  else if (data.keywords.length > 0) score += 10
  
  if (data.hasH1) score += 20
  
  if (data.readingTime > 0 && data.readingTime <= 10) score += 20
  else if (data.readingTime > 0) score += 10
  
  return score
}

export function SeoClient({ post }: SeoClientProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [autoKeywords, setAutoKeywords] = useState<string[]>([])
  
  const [formData, setFormData] = useState({
    title: post.title || '',
    metaDescription: post.metaDescription || post.excerpt || '',
    keywords: post.keywords ? post.keywords.split(',').map(k => k.trim()) : [],
    category: post.category || 'Business & Marketing',
    featuredImageUrl: post.featuredImageUrl || '',
    slug: post.slug || '',
    authorName: post.authorName || 'Anonymous'
  })

  const hasH1 = post.content.includes('# ')
  const seoScore = calculateSeoScore({
    title: formData.title,
    metaDescription: formData.metaDescription,
    keywords: formData.keywords,
    hasH1,
    readingTime: post.readingTimeMinutes || 5
  })

  useEffect(() => {
    const loadKeywords = async () => {
      if (formData.keywords.length === 0 && post.content) {
        try {
          const keywords = await extractKeywords(post.content, 5)
          setAutoKeywords(keywords)
          if (keywords.length > 0) {
            setFormData(prev => ({ ...prev, keywords }))
          }
        } catch (error) {
          console.error('Failed to extract keywords:', error)
        }
      }
    }
    loadKeywords()
  }, [post.content])

  const handleSave = async () => {
    setSaving(true)
    
    try {
      const response = await fetch(`/api/posts/${post.id}/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          metaDescription: formData.metaDescription,
          keywords: formData.keywords.join(','),
          category: formData.category,
          featuredImageUrl: formData.featuredImageUrl,
          slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 60),
          authorName: formData.authorName
        })
      })

      if (response.ok) {
        router.push(`/editor/${post.id}/review`)
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const addKeyword = (keyword: string) => {
    if (!formData.keywords.includes(keyword)) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }))
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xl font-bold text-slate-900">
              BlogAI
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/editor/${post.id}`}
              className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Edit
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Review
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          Optimize Your Post for Search Engines
        </h1>

        <div className="mb-6 flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-slate-700">SEO Score</span>
              <span className={`text-lg font-bold ${
                seoScore >= 80 ? 'text-green-600' : seoScore >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {seoScore}/100
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full transition-all ${getScoreColor(seoScore)}`} style={{ width: `${seoScore}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Essential Fields</h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Headline / Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                <p className={`mt-1 text-xs ${
                  formData.title.length > 60 ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {formData.title.length} characters {formData.title.length > 60 && '(Too long - SEO recommends 50-60)'}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                />
                <p className={`mt-1 text-xs ${
                  formData.metaDescription.length > 160 ? 'text-red-500' : 'text-slate-500'
                }`}>
                  {formData.metaDescription.length} characters (Ideal: 150-160)
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  SEO Keywords
                </label>
                <div className="flex flex-wrap gap-2 rounded-md border border-slate-300 p-2">
                  {formData.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Add keyword..."
                    className="flex-1 border-0 bg-transparent px-2 py-1 text-sm focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const value = e.currentTarget.value.trim()
                        if (value) {
                          addKeyword(value)
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option>Business & Marketing</option>
                  <option>Technology</option>
                  <option>Lifestyle</option>
                  <option>Health & Wellness</option>
                  <option>Finance</option>
                  <option>Education</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-4 font-semibold text-slate-900">SEO Checklist</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {formData.title.length <= 60 ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className={formData.title.length <= 60 ? 'text-slate-700' : 'text-yellow-700'}>
                  Title under 60 characters
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {(formData.metaDescription.length >= 150 && formData.metaDescription.length <= 160) ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className={(formData.metaDescription.length >= 150 && formData.metaDescription.length <= 160) ? 'text-slate-700' : 'text-yellow-700'}>
                  Meta description 150-160 characters
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {formData.keywords.length > 0 ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className={formData.keywords.length > 0 ? 'text-slate-700' : 'text-yellow-700'}>
                  Keywords present
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {hasH1 ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className={hasH1 ? 'text-slate-700' : 'text-yellow-700'}>
                  H1 tag present in content
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {(post.readingTimeMinutes || 5) <= 10 ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className={(post.readingTimeMinutes || 5) <= 10 ? 'text-slate-700' : 'text-yellow-700'}>
                  Reading time under 10 minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}