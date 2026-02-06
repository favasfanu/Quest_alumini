import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const applicationId = searchParams.get('applicationId')

  if (!applicationId) {
    return NextResponse.json({ error: 'applicationId is required' }, { status: 400 })
  }

  try {
    const application = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        applicantId: true,
        assignedToId: true,
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isAdmin = session.user.role === 'ADMIN'
    const isLoanManager = session.user.role === 'LOAN_MANAGER'
    const isApplicant = application.applicantId === session.user.id
    const isAssignedLoanManager = application.assignedToId === session.user.id

    const canView =
      isAdmin ||
      isApplicant ||
      (isLoanManager && (isAssignedLoanManager || application.assignedToId === null))

    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const repayments = await prisma.loanRepayment.findMany({
      where: { loanApplicationId: applicationId },
      orderBy: { repaymentMonth: 'asc' },
    })

    return NextResponse.json({ repayments })
  } catch (error) {
    console.error('Error fetching repayments:', error)
    return NextResponse.json({ error: 'Failed to fetch repayments' }, { status: 500 })
  }
}

