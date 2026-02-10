'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function GenerationProgressPage() {
  const { status } = useSession()
  const router = useRouter()
  const params = useParams()
  const jobId = params.jobId as string

  const [jobStatus, setJobStatus] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (!jobId || status !== 'authenticated') return

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/status?jobId=${jobId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to check status')
        }

        setJobStatus(data)
        setLoading(false)

        if (data.status === 'completed') {
          setTimeout(() => {
            router.push(`/editor/${jobId}`)
          }, 1500)
        } else if (data.status === 'failed') {
          setError(data.error || 'Generation failed')
        }
      } catch (err: any) {
        setError(err.message)
        setLoading(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 2000)

    return () => clearInterval(interval)
  }, [jobId, status, router])

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-lg text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  const progress = jobStatus?.progress || 0
  const estimatedTime = Math.max(10, Math.ceil((100 - progress) / 5))

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
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-800">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-medium">AI is writing...</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2 flex justify-between text-sm text-slate-600">
              <span>{progress}% Complete</span>
              <span>(~{estimatedTime} seconds remaining)</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-6 rounded-lg bg-slate-50 p-4">
            <h3 className="mb-2 font-medium text-slate-900">Topic</h3>
            <p className="text-slate-600">{jobStatus?.topic}</p>
            <div className="mt-3 flex gap-4 text-sm text-slate-500">
              <span>Tone: <span className="capitalize">{jobStatus?.tone}</span></span>
              <span>Length: <span className="capitalize">{jobStatus?.lengthPreference}</span></span>
            </div>
          </div>

          {jobStatus?.partialContent && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-slate-700">Preview</h3>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
                <pre className="whitespace-pre-wrap text-sm text-slate-600">
                  {jobStatus.partialContent}
                </pre>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
              <button
                onClick={() => window.location.reload()}
                className="ml-4 text-sm underline"
              >
                Retry
              </button>
            </div>
          )}

          <p className="text-center text-sm text-slate-500">
            You can leave this page and come back later. We&apos;ll notify you when it&apos;s ready!
          </p>
        </div>
      </main>
    </div>
  )
}