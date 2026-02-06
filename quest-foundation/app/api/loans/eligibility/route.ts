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
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isLoanEligible: true },
    })

    return NextResponse.json({ eligible: Boolean(user?.isLoanEligible) })
  } catch (error) {
    console.error('Error checking eligibility:', error)
    return NextResponse.json({ error: 'Failed to check eligibility' }, { status: 500 })
  }
}
