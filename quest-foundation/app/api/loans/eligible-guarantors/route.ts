import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        isLoanEligible: true,
        status: 'APPROVED',
        id: { not: session.user.id },
      },
      include: {
        profile: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        profile: {
          fullName: 'asc',
        },
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching eligible guarantors:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
