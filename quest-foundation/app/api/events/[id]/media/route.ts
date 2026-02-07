import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// POST - Add media to event (admin only)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { mediaUrl, mediaType, visibility } = body

    if (!mediaUrl) {
      return NextResponse.json({ error: 'Media URL is required' }, { status: 400 })
    }

    const media = await prisma.eventMedia.create({
      data: {
        eventId: params.id,
        mediaUrl,
        mediaType: mediaType || 'link',
        visibility: visibility || 'public'
      }
    })

    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    console.error('Error adding media:', error)
    return NextResponse.json({ error: 'Failed to add media' }, { status: 500 })
  }
}

// GET - Get all media for event (filtered by visibility for alumni)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === 'ADMIN'
    
    const media = await prisma.eventMedia.findMany({
      where: {
        eventId: params.id,
        ...(isAdmin ? {} : {visibility: 'public'})
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}
