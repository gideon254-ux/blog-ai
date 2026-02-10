import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'
import { ReviewClient } from './review-client'

export default async function ReviewPage({ params }: { params: { postId: string } }) {
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

  return <ReviewClient post={post} />
}