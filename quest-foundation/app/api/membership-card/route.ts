import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { generateCardNumber } from '@/lib/utils'
import QRCode from 'qrcode'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.user.role === 'NON_ALUMNI_MEMBER') {
    return NextResponse.json({ error: 'Non-alumni members are not eligible for membership cards' }, { status: 403 })
  }

  try {
    let card = await prisma.membershipCard.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!card) {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
      })

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      const cardNumber = generateCardNumber()
      const publicUrl = `${process.env.NEXTAUTH_URL}/member/${session.user.id}`
      const qrCodeData = await QRCode.toDataURL(publicUrl)

      card = await prisma.membershipCard.create({
        data: {
          userId: session.user.id,
          cardNumber,
          qrCodeData: publicUrl,
          qrCodeUrl: qrCodeData,
          cardStatus: 'ACTIVE',
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      })
    }

    return NextResponse.json({ card })
  } catch (error) {
    console.error('Error fetching membership card:', error)
    return NextResponse.json({ error: 'Failed to fetch membership card' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { action } = body

    if (action === 'regenerate') {
      const profile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
      })

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      const cardNumber = generateCardNumber()
      const publicUrl = `${process.env.NEXTAUTH_URL}/member/${session.user.id}`
      const qrCodeData = await QRCode.toDataURL(publicUrl)

      const card = await prisma.membershipCard.upsert({
        where: { userId: session.user.id },
        update: {
          cardNumber,
          qrCodeData: publicUrl,
          qrCodeUrl: qrCodeData,
          lastRegeneratedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          cardNumber,
          qrCodeData: publicUrl,
          qrCodeUrl: qrCodeData,
          cardStatus: 'ACTIVE',
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      })

      return NextResponse.json({ card })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing membership card request:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
