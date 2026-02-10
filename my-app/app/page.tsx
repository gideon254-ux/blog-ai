import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/next-auth'
import { Sparkles, FileText, Zap, Shield } from 'lucide-react'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-xl font-bold text-slate-900">BlogAI</span>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="mb-6 text-4xl font-bold text-slate-900 sm:text-5xl">
            AI-Powered Blog Creator
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
            Generate high-quality blog posts with AI, edit and refine them with our rich text editor,
            optimize for SEO, and publish with one click.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/register"
              className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Start Creating Free
            </Link>
            <Link
              href="/auth/login"
              className="rounded-md border border-slate-300 px-6 py-3 text-slate-700 hover:bg-slate-50"
            >
              Sign In
            </Link>
          </div>
        </section>

        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 text-center text-2xl font-bold text-slate-900">
              Everything you need to create amazing content
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-6">
                <Sparkles className="mb-4 h-8 w-8 text-blue-600" />
                <h3 className="mb-2 font-semibold text-slate-900">AI Generation</h3>
                <p className="text-sm text-slate-600">
                  Generate complete blog posts in seconds using advanced AI
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-6">
                <FileText className="mb-4 h-8 w-8 text-green-600" />
                <h3 className="mb-2 font-semibold text-slate-900">Rich Editor</h3>
                <p className="text-sm text-slate-600">
                  Edit and refine with our powerful rich text editor
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-6">
                <Zap className="mb-4 h-8 w-8 text-yellow-600" />
                <h3 className="mb-2 font-semibold text-slate-900">SEO Optimized</h3>
                <p className="text-sm text-slate-600">
                  Built-in SEO tools to help your content rank higher
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-6">
                <Shield className="mb-4 h-8 w-8 text-purple-600" />
                <h3 className="mb-2 font-semibold text-slate-900">One-Click Publish</h3>
                <p className="text-sm text-slate-600">
                  Publish instantly or schedule for later
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 px-4 py-8 text-center text-slate-400 sm:px-6 lg:px-8">
        <p>© 2024 BlogAI. All rights reserved.</p>
      </footer>
    </div>
  )
}