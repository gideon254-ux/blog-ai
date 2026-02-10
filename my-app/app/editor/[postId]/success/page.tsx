import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'
import { SuccessClient } from './success-client'

export default async function SuccessPage({ params }: { params: { postId: string } }) {
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

  return <SuccessClient post={post} />
}