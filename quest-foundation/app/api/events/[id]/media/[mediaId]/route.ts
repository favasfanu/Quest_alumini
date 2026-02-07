import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// DELETE - Remove media (admin only)
export async function DELETE(req: Request, { params }: { params: { id: string; mediaId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.eventMedia.delete({
      where: { id: params.mediaId }
    })

    return NextResponse.json({ message: 'Media deleted successfully' })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
  }
}

// PATCH - Update media visibility (admin only)
export async function PATCH(req: Request, { params }: { params: { id: string; mediaId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { visibility } = body

    if (!visibility || !['admin_only', 'public'].includes(visibility)) {
      return NextResponse.json({ error: 'Invalid visibility value' }, { status: 400 })
    }

    const media = await prisma.eventMedia.update({
      where: { id: params.mediaId },
      data: { visibility }
    })

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
  }
}
