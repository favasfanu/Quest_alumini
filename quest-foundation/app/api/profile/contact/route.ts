import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const contactDetails = await prisma.contactDetails.upsert({
      where: { profileId: profile.id },
      update: {
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        linkedinUrl: data.linkedinUrl,
        instagramUrl: data.instagramUrl,
      },
      create: {
        profileId: profile.id,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        linkedinUrl: data.linkedinUrl,
        instagramUrl: data.instagramUrl,
      },
    })

    return NextResponse.json({ contactDetails })
  } catch (error) {
    console.error('Error updating contact details:', error)
    return NextResponse.json({ error: 'Failed to update contact details' }, { status: 500 })
  }
}
