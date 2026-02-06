import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
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

    const privacySettings = await prisma.profilePrivacySettings.upsert({
      where: { profileId: profile.id },
      update: {
        familyDetailsVisible: data.familyDetailsVisible,
        educationVisible: data.educationVisible,
        jobHistoryVisible: data.jobHistoryVisible,
        currentJobVisible: data.currentJobVisible,
        contactDetailsVisible: data.contactDetailsVisible,
      },
      create: {
        profileId: profile.id,
        familyDetailsVisible: data.familyDetailsVisible,
        educationVisible: data.educationVisible,
        jobHistoryVisible: data.jobHistoryVisible,
        currentJobVisible: data.currentJobVisible,
        contactDetailsVisible: data.contactDetailsVisible,
      },
    })

    return NextResponse.json({ privacySettings })
  } catch (error) {
    console.error('Error updating privacy settings:', error)
    return NextResponse.json({ error: 'Failed to update privacy settings' }, { status: 500 })
  }
}
