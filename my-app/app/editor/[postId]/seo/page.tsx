import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'
import { SeoClient } from './seo-client'

export default async function SeoPage({ params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    notFound()
  }

  const post = await prisma.blogPost.findFirst({
    where: {
      id: params.postId,
      userId: session.user.id
    }
  })

  if (!post) {
    notFound()
  }

  return <SeoClient post={post} />
}