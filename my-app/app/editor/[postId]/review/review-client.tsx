'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Globe, Calendar, Save } from 'lucide-react'
import { format } from 'date-fns'

interface ReviewClientProps {
  post: {
    id: string
    title: string
    content: string
    excerpt?: string | null
    metaDescription?: string | null
    category?: string | null
    keywords?: string | null
    featuredImageUrl?: string | null
    slug: string
    wordCount?: number | null
    readingTimeMinutes?: number | null
    status: string
  }
}

export function ReviewClient({ post }: ReviewClientProps) {
  const router = useRouter()
  const [publishing, setPublishing] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishNow: true })
      })

      if (response.ok) {
        router.push(`/editor/${post.id}/success`)
      }
    } catch (error) {
      console.error('Publish error:', error)
    } finally {
      setPublishing(false)
    }
  }

  const handleSchedule = async () => {
    if (!scheduledDate) return
    
    setPublishing(true)
    try {
      const response = await fetch(`/api/posts/${post.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: new Date(scheduledDate).toISOString() })
      })

      if (response.ok) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Schedule error:', error)
    } finally {
      setPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-xl font-bold text-slate-900">
            BlogAI
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={`/editor/${post.id}/seo`}
              className="flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Edit SEO
            </Link>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              <Globe className="h-4 w-4" />
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          Ready to Publish? Review Your Post
        </h1>

        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Post Preview</h2>
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
              Ready
            </span>
          </div>

          <div className="rounded-lg border border-slate-200 p-6">
            {post.featuredImageUrl && (
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="mb-4 h-48 w-full rounded-lg object-cover"
              />
            )}
            <h1 className="mb-2 text-2xl font-bold text-slate-900">{post.title}</h1>
            <p className="mb-4 text-slate-600">{post.metaDescription || post.excerpt}</p>
            <div className="flex gap-4 text-sm text-slate-500">
              <span>{post.wordCount || 0} words</span>
              <span>•</span>
              <span>{post.readingTimeMinutes || 5} min read</span>
            </div>
          </div>

          <div className="mt-4 grid gap-4 text-sm">
            <div>
              <span className="text-slate-500">Category:</span>{' '}
              <span className="font-medium">{post.category || 'Uncategorized'}</span>
            </div>
            <div>
              <span className="text-slate-500">Keywords:</span>{' '}
              <span className="font-medium">{post.keywords || 'None'}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="flex flex-col items-center gap-2 rounded-lg bg-green-600 p-6 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            <Globe className="h-8 w-8" />
            <span className="text-lg font-semibold">Publish Now</span>
            <span className="text-sm opacity-90">Go live instantly</span>
          </button>

          <div className="rounded-lg border-2 border-slate-200 p-6">
            <div className="mb-4 flex items-center gap-2 text-slate-700">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">Schedule for Later</span>
            </div>
            <input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2"
            />
            <button
              onClick={handleSchedule}
              disabled={!scheduledDate || publishing}
              className="w-full rounded-md bg-slate-800 py-2 text-white transition-colors hover:bg-slate-900 disabled:opacity-50"
            >
              Schedule
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </button>
        </div>
      </main>
    </div>
  )
}