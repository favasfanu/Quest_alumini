import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        privacySettings: true,
        contactDetails: true,
        educationRecords: {
          orderBy: { startYear: 'desc' },
        },
        jobExperiences: {
          orderBy: { startDate: 'desc' },
        },
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const profile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        fullName: data.fullName,
        batchYear: data.batchYear ? parseInt(data.batchYear) : null,
        department: data.department,
        course: data.course,
        currentlyWorking: data.currentlyWorking,
        currentlyStudying: data.currentlyStudying,
        city: data.city,
        state: data.state,
        country: data.country,
        maritalStatus: data.maritalStatus,
        spouseName: data.spouseName,
        childrenCount: data.childrenCount ? parseInt(data.childrenCount) : 0,
      },
      include: {
        privacySettings: true,
        contactDetails: true,
        educationRecords: true,
        jobExperiences: true,
      },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
