import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/next-auth'
import { EditorClient } from './editor-client'

export default async function EditorPage({ params }: { params: { postId: string } }) {
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
    const job = await prisma.generationJob.findFirst({
      where: {
        id: params.postId,
        userId: session.user.id
      },
      include: {
        blogPost: true
      }
    })

    if (job?.blogPost) {
      return <EditorClient post={job.blogPost} />
    }

    notFound()
  }

  return <EditorClient post={post} />
}