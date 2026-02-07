import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// DELETE - Remove participant from event (admin only)
export async function DELETE(req: Request, { params }: { params: { id: string; userId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: params.userId
        }
      }
    })

    return NextResponse.json({ message: 'Participant removed successfully' })
  } catch (error) {
    console.error('Error removing participant:', error)
    return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 })
  }
}
