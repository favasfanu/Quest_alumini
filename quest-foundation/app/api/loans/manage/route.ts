import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'LOAN_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const applications = await prisma.loanApplication.findMany({
      include: {
        applicant: {
          include: {
            profile: true,
          },
        },
        loanCategory: true,
        guarantor1: {
          include: {
            profile: true,
          },
        },
        guarantor2: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Error fetching loan applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'LOAN_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { applicationId, action, remarks, rejectionReason } = await request.json()

    const oldApplication = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
    })

    let updates: any = {
      reviewedById: session.user.id,
      reviewedAt: new Date(),
      remarks,
    }

    if (action === 'approve') {
      updates.status = 'APPROVED'
      updates.approvedById = session.user.id
      updates.approvedAt = new Date()
    } else if (action === 'reject') {
      updates.status = 'REJECTED'
      updates.rejectionReason = rejectionReason
    } else if (action === 'transfer_funds') {
      updates.status = 'FUNDS_TRANSFERRED'
      updates.fundsTransferredAt = new Date()
    } else if (action === 'activate') {
      updates.status = 'ACTIVE_LOAN'
    } else if (action === 'complete') {
      updates.status = 'COMPLETED'
      updates.completedAt = new Date()
    }

    const application = await prisma.loanApplication.update({
      where: { id: applicationId },
      data: updates,
      include: {
        applicant: {
          include: {
            profile: true,
          },
        },
        loanCategory: true,
        guarantor1: {
          include: {
            profile: true,
          },
        },
        guarantor2: {
          include: {
            profile: true,
          },
        },
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: `LOAN_${action.toUpperCase()}`,
      entityType: 'LoanApplication',
      entityId: applicationId,
      oldValues: oldApplication,
      newValues: application,
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error updating loan application:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}
