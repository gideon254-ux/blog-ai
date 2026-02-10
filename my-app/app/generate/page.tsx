'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

const suggestedTopics = [
  "How to Start a Blog in 2024",
  "5 Tips for Remote Work",
  "Latest SEO Trends",
  "AI Tools for Content Creation",
  "Digital Marketing Strategies"
]

const toneOptions = ["Professional", "Casual", "Friendly", "Authoritative"]
const contentTypes = ["Blog Post", "How-To Guide", "Listicle", "Opinion Piece", "Tutorial", "Case Study"]
const lengthOptions = [
  { value: "short", label: "Short", desc: "300-500 words" },
  { value: "medium", label: "Medium", desc: "800-1200 words" },
  { value: "long", label: "Long", desc: "2000+ words" }
]

export default function GeneratePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [topic, setTopic] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [tone, setTone] = useState('professional')
  const [contentType, setContentType] = useState('blog_post')
  const [length, setLength] = useState('medium')
  const [targetAudience, setTargetAudience] = useState<string[]>(['beginners'])
  const [sections, setSections] = useState<string[]>(['introduction', 'bullet_points', 'conclusion'])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    const saved = localStorage.getItem('generationSettings')
    if (saved) {
      const settings = JSON.parse(saved)
      setTone(settings.tone || 'professional')
      setContentType(settings.contentType || 'blog_post')
      setLength(settings.length || 'medium')
      setTargetAudience(settings.targetAudience || ['beginners'])
      setSections(settings.sections || ['introduction', 'bullet_points', 'conclusion'])
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)
    setError('')

    localStorage.setItem('generationSettings', JSON.stringify({
      tone, contentType, length, targetAudience, sections
    }))

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          tone,
          contentType,
          lengthPreference: length,
          targetAudience: targetAudience.join(','),
          sectionsToInclude: sections.join(',')
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start generation')
      }

      router.push(`/generate/${data.jobId}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const toggleArrayValue = (arr: string[], val: string, setter: (val: string[]) => void) => {
    if (arr.includes(val)) {
      setter(arr.filter(v => v !== val))
    } else {
      setter([...arr, val])
    }
  }

  if (status === 'loading') {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-xl font-bold text-slate-900">
            BlogAI
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          Let&apos;s Create a Blog Post
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <label htmlFor="topic" className="mb-2 block text-lg font-medium text-slate-900">
              What do you want to write about?
            </label>
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Digital marketing trends for small businesses..."
              className="min-h-[120px] w-full rounded-lg border border-slate-300 p-4 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="mt-4 w-full rounded-lg bg-blue-600 py-3 text-lg font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Generate Post'}
            </button>
            <p className="mt-2 text-center text-sm text-slate-500">
              or press Ctrl+Enter
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 py-3 text-slate-700 hover:bg-slate-50"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </button>

          {showAdvanced && (
            <div className="rounded-lg bg-white p-6 shadow-sm space-y-6">
              <div>
                <label className="mb-2 block font-medium text-slate-700">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {toneOptions.map(t => (
                    <option key={t.toLowerCase()} value={t.toLowerCase()}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-700">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {contentTypes.map(t => (
                    <option key={t.toLowerCase().replace(/ /g, '_')} value={t.toLowerCase().replace(/ /g, '_')}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-700">Length</label>
                <div className="flex gap-4">
                  {lengthOptions.map((opt) => (
                    <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="length"
                        value={opt.value}
                        checked={length === opt.value}
                        onChange={(e) => setLength(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm">
                        {opt.label} <span className="text-slate-500">({opt.desc})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-700">Target Audience</label>
                <div className="flex gap-4">
                  {['Beginners', 'Professionals', 'Mixed'].map((aud) => (
                    <label key={aud} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={targetAudience.includes(aud.toLowerCase())}
                        onChange={() => toggleArrayValue(targetAudience, aud.toLowerCase(), setTargetAudience)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <span className="text-sm">{aud}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-medium text-slate-700">Sections to Include</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'introduction', label: 'Introduction' },
                    { id: 'bullet_points', label: 'Bullet Points' },
                    { id: 'conclusion', label: 'Conclusion' },
                    { id: 'call_to_action', label: 'Call-to-Action' },
                    { id: 'faq_section', label: 'FAQ Section' }
                  ].map((section) => (
                    <label key={section.id} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sections.includes(section.id)}
                        onChange={() => toggleArrayValue(sections, section.id, setSections)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <span className="text-sm">{section.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="mt-8">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Suggested Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition-colors hover:border-blue-500 hover:bg-blue-50"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}