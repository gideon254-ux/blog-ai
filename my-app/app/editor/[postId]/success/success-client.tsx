'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Copy, ExternalLink, Twitter, Linkedin, Facebook, MessageCircle, Sparkles, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'

interface SuccessClientProps {
  post: {
    id: string
    title: string
    slug: string
    publishedAt: Date | null
  }
}

export function SuccessClient({ post }: SuccessClientProps) {
  const [copied, setCopied] = useState(false)

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/posts/${post.slug}`

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareText = encodeURIComponent(`Check out my new blog post: ${post.title}`)
  const shareUrl = encodeURIComponent(publicUrl)

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
        <div className="text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Success!</h1>
          <p className="text-slate-600">Your blog post has been published successfully!</p>
        </div>

        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{post.title}</h2>
          <p className="mb-2 text-sm text-slate-500">
            Published on: {post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy h:mm a') : 'Just now'}
          </p>
          <p className="mb-4 text-sm text-slate-500">
            Public URL: <span className="break-all text-blue-600">{publicUrl}</span>
          </p>
          <div className="flex gap-3">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              View Post
            </a>
            <button
              onClick={handleCopy}
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-slate-300 py-2 text-slate-700 hover:bg-slate-50"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-4 text-center text-sm font-medium text-slate-700">Share This Post</h3>
          <div className="flex justify-center gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-400 text-white hover:bg-blue-500"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link
            href="/generate"
            className="flex flex-col items-center gap-2 rounded-lg bg-white p-6 shadow-sm transition-colors hover:bg-slate-50"
          >
            <Sparkles className="h-8 w-8 text-yellow-500" />
            <span className="font-semibold text-slate-900">Create Another Post</span>
            <span className="text-sm text-slate-500">Generate new content</span>
          </Link>
          <div className="flex flex-col items-center gap-2 rounded-lg bg-slate-100 p-6 opacity-60">
            <BarChart3 className="h-8 w-8 text-slate-400" />
            <span className="font-semibold text-slate-700">View Analytics</span>
            <span className="text-sm text-slate-500">Coming soon</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}