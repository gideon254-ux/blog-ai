import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Clock, User } from 'lucide-react'

export default async function PublicPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: {
      slug: params.slug,
      status: 'published'
    },
    include: {
      user: {
        select: {
          name: true
        }
      }
    }
  })

  if (!post) {
    notFound()
  }

  await prisma.blogPost.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-xl font-bold text-slate-900">
            BlogAI
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-8">
        {post.featuredImageUrl && (
          <img
            src={post.featuredImageUrl}
            alt={post.title}
            className="mb-8 h-64 w-full rounded-lg object-cover"
          />
        )}

        <header className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {post.authorName || post.user.name || 'Anonymous'}
            </span>
            <span>•</span>
            <span>{post.publishedAt ? format(new Date(post.publishedAt), 'MMMM d, yyyy') : ''}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingTimeMinutes || 5} min read
            </span>
          </div>
        </header>

        <div
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  )
}