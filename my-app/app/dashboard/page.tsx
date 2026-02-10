import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'
import Link from 'next/link'
import { PenSquare, FileText, Clock, BarChart3 } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/login')
  }

  const userId = session.user.id

  const [user, posts, totalViews, draftCount, publishedCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    }),
    prisma.blogPost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        viewCount: true,
        featuredImageUrl: true,
        slug: true
      }
    }),
    prisma.blogPost.aggregate({
      where: { userId, status: 'published' },
      _sum: { viewCount: true }
    }),
    prisma.blogPost.count({
      where: { userId, status: 'draft' }
    }),
    prisma.blogPost.count({
      where: { userId, status: 'published' }
    })
  ])

  const totalPosts = draftCount + publishedCount

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <PenSquare className="h-5 w-5" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/generate"
                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-white transition-colors hover:bg-blue-700"
                >
                  <PenSquare className="h-4 w-4" />
                  Generate New Post
                </Link>
                <Link
                  href="/posts"
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4" />
                  View All Posts
                </Link>
                <Link
                  href="/posts?status=draft"
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Clock className="h-4 w-4" />
                  Drafts ({draftCount})
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BarChart3 className="h-5 w-5" />
              Your Stats
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Total Posts</span>
                <span className="font-semibold text-slate-900">{totalPosts}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Total Views</span>
                <span className="font-semibold text-slate-900">{totalViews._sum.viewCount || 0}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Drafts</span>
                <span className="font-semibold text-slate-900">{draftCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Published</span>
                <span className="font-semibold text-slate-900">{publishedCount}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm md:col-span-2 lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Recent Posts</h2>
            {posts.length === 0 ? (
              <p className="text-slate-500">No posts yet. Create your first post!</p>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/editor/${post.id}`}
                    className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-blue-300 hover:bg-slate-50"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-slate-200">
                      {post.featuredImageUrl ? (
                        <img
                          src={post.featuredImageUrl}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <FileText className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-medium text-slate-900">{post.title}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {post.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                        <span>•</span>
                        <span>{post.viewCount} views</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}