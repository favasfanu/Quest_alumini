import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'LOAN_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Both ADMIN and LOAN_MANAGER should see all loan applications
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
        assignedTo: {
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

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'LOAN_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { applicationId, action, remarks, rejectionReason, assignedToId, repaymentId, paidAmount } =
      await request.json()

    const oldApplication = await prisma.loanApplication.findUnique({
      where: { id: applicationId },
    })

    if (!oldApplication) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const isAdmin = dbUser.role === 'ADMIN'
    const isAssignedLoanManager =
      oldApplication.assignedToId && oldApplication.assignedToId === session.user.id

    const canManageApplication =
      isAdmin || isAssignedLoanManager || action === 'claim'

    if (!canManageApplication) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Claim/reassign does not require reviewedBy fields
    let updates: any = {
      remarks,
    }

    if (action !== 'claim' && action !== 'reassign' && action !== 'mark_emi_paid') {
      updates.reviewedById = session.user.id
      updates.reviewedAt = new Date()
    }

    if (action === 'approve') {
      if (oldApplication.status !== 'SUBMITTED' && oldApplication.status !== 'UNDER_REVIEW') {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
      }
      updates.status = 'APPROVED'
      updates.approvedById = session.user.id
      updates.approvedAt = new Date()
    } else if (action === 'reject') {
      if (oldApplication.status !== 'SUBMITTED' && oldApplication.status !== 'UNDER_REVIEW') {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
      }
      updates.status = 'REJECTED'
      updates.rejectionReason = rejectionReason
    } else if (action === 'transfer_funds') {
      if (oldApplication.status !== 'APPROVED') {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
      }
      updates.status = 'FUNDS_TRANSFERRED'
      updates.fundsTransferredAt = new Date()
    } else if (action === 'activate') {
      if (oldApplication.status !== 'FUNDS_TRANSFERRED') {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
      }
      updates.status = 'ACTIVE_LOAN'
    } else if (action === 'complete') {
      if (oldApplication.status !== 'ACTIVE_LOAN') {
        return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
      }
      updates.status = 'COMPLETED'
      updates.completedAt = new Date()
    } else if (action === 'claim') {
      if (!oldApplication.assignedToId) {
        updates.assignedToId = session.user.id
        updates.assignedAt = new Date()
        if (oldApplication.status === 'SUBMITTED') {
          updates.status = 'UNDER_REVIEW'
        }
      }
    } else if (action === 'reassign') {
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      updates.assignedToId = assignedToId || null
      updates.assignedAt = assignedToId ? new Date() : null
    } else if (action === 'mark_emi_paid') {
      if (!repaymentId) {
        return NextResponse.json({ error: 'repaymentId is required' }, { status: 400 })
      }
      const increment = Number(paidAmount || 0)
      if (!Number.isFinite(increment) || increment <= 0) {
        return NextResponse.json({ error: 'paidAmount must be a positive number' }, { status: 400 })
      }

      const repayment = await prisma.loanRepayment.findFirst({
        where: { id: repaymentId, loanApplicationId: applicationId },
      })
      if (!repayment) {
        return NextResponse.json({ error: 'Repayment not found' }, { status: 404 })
      }

      const newPaid = Number(repayment.paidAmount) + increment
      const due = Number(repayment.dueAmount)
      const newStatus =
        newPaid >= due ? 'PAID' : newPaid > 0 ? 'PARTIAL' : 'PENDING'

      const updatedRepayment = await prisma.loanRepayment.update({
        where: { id: repayment.id },
        data: {
          paidAmount: newPaid,
          paidDate: newStatus === 'PAID' ? new Date() : repayment.paidDate,
          paymentStatus: newStatus,
        },
      })

      await createAuditLog({
        userId: session.user.id,
        action: 'LOAN_EMI_UPDATE',
        entityType: 'LoanRepayment',
        entityId: repayment.id,
        oldValues: repayment,
        newValues: updatedRepayment,
      })

      // If all repayments are paid, auto-complete the loan
      const remaining = await prisma.loanRepayment.count({
        where: { loanApplicationId: applicationId, paymentStatus: { not: 'PAID' } },
      })
      if (remaining === 0 && oldApplication.status === 'ACTIVE_LOAN') {
        const completed = await prisma.loanApplication.update({
          where: { id: applicationId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        })

        await createAuditLog({
          userId: session.user.id,
          action: 'LOAN_AUTO_COMPLETED',
          entityType: 'LoanApplication',
          entityId: applicationId,
          oldValues: oldApplication,
          newValues: completed,
        })
      }

      const applicationWithInclude = await prisma.loanApplication.findUnique({
        where: { id: applicationId },
        include: {
          applicant: { include: { profile: true } },
          loanCategory: true,
          guarantor1: { include: { profile: true } },
          guarantor2: { include: { profile: true } },
          assignedTo: { include: { profile: true } },
        },
      })

      return NextResponse.json({ application: applicationWithInclude })
    }

    const application = await prisma.$transaction(async (tx) => {
      const updated = await tx.loanApplication.update({
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
          assignedTo: {
            include: {
              profile: true,
            },
          },
        },
      })

      // After funds transfer, generate repayment schedule if not present
      if (action === 'transfer_funds') {
        const existingCount = await tx.loanRepayment.count({
          where: { loanApplicationId: applicationId },
        })

        if (existingCount === 0) {
          const baseDate = updated.fundsTransferredAt || new Date()
          const addMonths = (date: Date, months: number) => {
            const d = new Date(date)
            d.setMonth(d.getMonth() + months)
            return d
          }

          const emi = updated.emiAmount
          const repayments = Array.from({ length: updated.repaymentMonths }, (_, idx) => {
            const repaymentMonth = idx + 1
            return {
              loanApplicationId: applicationId,
              repaymentMonth,
              dueAmount: emi,
              dueDate: addMonths(baseDate, repaymentMonth),
              paidAmount: 0,
              paymentStatus: 'PENDING' as const,
            }
          })

          await tx.loanRepayment.createMany({
            data: repayments,
          })
        }
      }

      return updated
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
