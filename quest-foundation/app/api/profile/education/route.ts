import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
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

    const education = await prisma.educationRecord.create({
      data: {
        profileId: profile.id,
        institution: data.institution,
        degree: data.degree,
        fieldOfStudy: data.fieldOfStudy,
        startYear: parseInt(data.startYear),
        endYear: data.endYear ? parseInt(data.endYear) : null,
        currentlyStudying: data.currentlyStudying || false,
      },
    })

    return NextResponse.json({ education })
  } catch (error) {
    console.error('Error creating education:', error)
    return NextResponse.json({ error: 'Failed to create education record' }, { status: 500 })
  }
}
