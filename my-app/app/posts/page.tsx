import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'
import Link from 'next/link'
import { FileText, Edit2, Trash2, Eye } from 'lucide-react'

export default async function PostsPage({
  searchParams
}: {
  searchParams: { status?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const status = searchParams.status || 'all'

  const where: any = { userId: session.user.id }
  if (status !== 'all') {
    where.status = status
  }

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      createdAt: true,
      viewCount: true,
      featuredImageUrl: true,
      category: true,
      wordCount: true,
      readingTimeMinutes: true
    }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-xl font-bold text-slate-900">
            BlogAI
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session.user.email}</span>
            <Link
              href="/api/auth/signout"
              className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">All Posts</h1>
          <Link
            href="/generate"
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create New Post
          </Link>
        </div>

        <div className="mb-6 flex gap-2">
          {['all', 'published', 'draft', 'scheduled'].map((filter) => (
            <Link
              key={filter}
              href={`/posts?status=${filter}`}
              className={`rounded-md px-4 py-2 text-sm capitalize ${
                status === filter
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {filter}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="mb-2 text-lg font-semibold text-slate-900">No posts found</h3>
            <p className="mb-4 text-slate-500">Get started by creating your first blog post</p>
            <Link
              href="/generate"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Create Post
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 aspect-video overflow-hidden rounded-md bg-slate-200">
                  {post.featuredImageUrl ? (
                    <img
                      src={post.featuredImageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <FileText className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900">{post.title}</h3>
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    post.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : post.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {post.status}
                  </span>
                  {post.category && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="mb-3 text-xs text-slate-500">
                  {post.wordCount} words • {post.readingTimeMinutes || 5} min • {post.viewCount} views
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/editor/${post.id}`}
                    className="flex flex-1 items-center justify-center gap-1 rounded-md bg-slate-100 py-2 text-sm text-slate-700 hover:bg-slate-200"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Link>
                  {post.status === 'published' && (
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="flex flex-1 items-center justify-center gap-1 rounded-md bg-blue-100 py-2 text-sm text-blue-700 hover:bg-blue-200"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}