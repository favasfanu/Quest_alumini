import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - Fetch single event
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === 'ADMIN'
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        media: isAdmin 
          ? true 
          : { where: { visibility: 'public' } },
        participants: {
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
                    batchYear: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if alumni is a participant
    if (!isAdmin) {
      const isParticipant = event.participants.some(p => p.userId === session.user.id)
      if (!isParticipant) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Add computed status
    const now = new Date()
    const eventWithStatus = {
      ...event,
      status: now < event.startDate 
        ? 'upcoming' 
        : now >= event.startDate && now <= event.endDate 
          ? 'ongoing' 
          : 'completed'
    }

    return NextResponse.json({ event: eventWithStatus })
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

// PATCH - Update event (admin only)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { name, location, mapLink, startDate, endDate, description } = body

    // Validation
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)

      if (end <= start) {
        return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
      }
    }

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(location !== undefined && { location }),
        ...(mapLink !== undefined && { mapLink }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(description !== undefined && { description })
      },
      include: {
        media: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE - Delete event (admin only)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.event.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
