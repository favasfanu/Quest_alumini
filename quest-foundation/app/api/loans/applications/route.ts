import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { calculateLoan } from '@/lib/loan-calculator'
import { createAuditLog } from '@/lib/audit'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const applications = await prisma.loanApplication.findMany({
      where: { applicantId: session.user.id },
      include: {
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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!session.user.isLoanEligible) {
    return NextResponse.json({ error: 'You are not eligible for loans' }, { status: 403 })
  }

  try {
    const data = await request.json()

    const category = await prisma.loanCategory.findUnique({
      where: { id: data.loanCategoryId },
    })

    if (!category || !category.isEnabled) {
      return NextResponse.json({ error: 'Invalid loan category' }, { status: 400 })
    }

    const loanAmount = parseFloat(data.loanAmount)

    if (loanAmount > parseFloat(category.maxLoanAmount.toString())) {
      return NextResponse.json({ error: 'Loan amount exceeds maximum limit' }, { status: 400 })
    }

    const calculation = calculateLoan(
      loanAmount,
      parseFloat(category.monthlyInterestRate.toString()),
      category.repaymentDurationMonths
    )

    const guarantor1 = await prisma.user.findUnique({
      where: { id: data.guarantor1Id },
    })

    const guarantor2 = await prisma.user.findUnique({
      where: { id: data.guarantor2Id },
    })

    if (!guarantor1?.isLoanEligible || !guarantor2?.isLoanEligible) {
      return NextResponse.json({ error: 'Guarantors must be loan eligible' }, { status: 400 })
    }

    const guarantor1ActiveLoans = await prisma.loanApplication.count({
      where: {
        OR: [
          { guarantor1Id: data.guarantor1Id },
          { guarantor2Id: data.guarantor1Id },
        ],
        status: { in: ['APPROVED', 'FUNDS_TRANSFERRED', 'ACTIVE_LOAN'] },
      },
    })

    const guarantor2ActiveLoans = await prisma.loanApplication.count({
      where: {
        OR: [
          { guarantor1Id: data.guarantor2Id },
          { guarantor2Id: data.guarantor2Id },
        ],
        status: { in: ['APPROVED', 'FUNDS_TRANSFERRED', 'ACTIVE_LOAN'] },
      },
    })

    if (guarantor1ActiveLoans >= category.guarantorActiveLoanLimit) {
      return NextResponse.json({ error: 'Guarantor 1 has reached active loan limit' }, { status: 400 })
    }

    if (guarantor2ActiveLoans >= category.guarantorActiveLoanLimit) {
      return NextResponse.json({ error: 'Guarantor 2 has reached active loan limit' }, { status: 400 })
    }

    const application = await prisma.loanApplication.create({
      data: {
        applicantId: session.user.id,
        loanCategoryId: data.loanCategoryId,
        loanAmount: calculation.loanAmount,
        monthlyInterest: calculation.monthlyInterest,
        totalPayable: calculation.totalPayable,
        emiAmount: calculation.emiAmount,
        repaymentMonths: calculation.repaymentMonths,
        guarantor1Id: data.guarantor1Id,
        guarantor1Confirmed: data.guarantor1Confirmed,
        guarantor2Id: data.guarantor2Id,
        guarantor2Confirmed: data.guarantor2Confirmed,
        purpose: data.purpose,
        status: 'SUBMITTED',
      },
      include: {
        loanCategory: true,
        guarantor1: {
          include: { profile: true },
        },
        guarantor2: {
          include: { profile: true },
        },
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'SUBMIT_LOAN_APPLICATION',
      entityType: 'LoanApplication',
      entityId: application.id,
      newValues: application,
    })

    return NextResponse.json({ application })
  } catch (error) {
    console.error('Error creating loan application:', error)
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}
