import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// POST - Add participant to event (admin only)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if already a participant
    const existing = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId
        }
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'User is already a participant' }, { status: 400 })
    }

    const participant = await prisma.eventParticipant.create({
      data: {
        eventId: params.id,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                alumniId: true,
                profilePhotoUrl: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ participant }, { status: 201 })
  } catch (error) {
    console.error('Error adding participant:', error)
    return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 })
  }
}

// GET - Get all participants for event
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const participants = await prisma.eventParticipant.findMany({
      where: { eventId: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                alumniId: true,
                profilePhotoUrl: true,
                batchYear: true,
                department: true
              }
            }
          }
        }
      },
      orderBy: { addedAt: 'desc' }
    })

    return NextResponse.json({ participants })
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
  }
}
