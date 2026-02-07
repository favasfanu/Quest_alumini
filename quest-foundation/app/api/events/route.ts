import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET - Fetch all events (admin sees all, alumni sees only their events)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = session.user.role === 'ADMIN'
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // upcoming | ongoing | completed

    const now = new Date()
    let whereClause: any = {}

    // Status filtering
    if (status === 'upcoming') {
      whereClause.startDate = { gt: now }
    } else if (status === 'ongoing') {
      whereClause.AND = [
        { startDate: { lte: now } },
        { endDate: { gte: now } }
      ]
    } else if (status === 'completed') {
      whereClause.endDate = { lt: now }
    }

    // Alumni only see events they're participating in
    if (!isAdmin) {
      whereClause.participants = {
        some: { userId: session.user.id }
      }
    }

    const events = await prisma.event.findMany({
      where: whereClause,
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
                    profilePhotoUrl: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { startDate: 'desc' }
    })

    // Add computed status for each event
    const eventsWithStatus = events.map(event => ({
      ...event,
      status: now < event.startDate 
        ? 'upcoming' 
        : now >= event.startDate && now <= event.endDate 
          ? 'ongoing' 
          : 'completed'
    }))

    return NextResponse.json({ events: eventsWithStatus })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST - Create new event (admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const { name, location, mapLink, startDate, endDate, description, mediaLinks, participantIds } = body

    // Validation
    if (!name || !startDate || !endDate) {
      return NextResponse.json({ error: 'Name, start date, and end date are required' }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (end <= start) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    // Create event with media and participants
    const event = await prisma.event.create({
      data: {
        name,
        location: location || null,
        mapLink: mapLink || null,
        startDate: start,
        endDate: end,
        description: description || null,
        media: mediaLinks?.length ? {
          create: mediaLinks.map((link: any) => ({
            mediaUrl: link.url,
            mediaType: link.type || null,
            visibility: link.visibility || 'public'
          }))
        } : undefined,
        participants: participantIds?.length ? {
          create: participantIds.map((userId: string) => ({ userId }))
        } : undefined
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

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
