import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const categories = await prisma.loanCategory.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching loan categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const category = await prisma.loanCategory.create({
      data: {
        name: data.name,
        description: data.description,
        maxLoanAmount: parseFloat(data.maxLoanAmount),
        monthlyInterestRate: parseFloat(data.monthlyInterestRate),
        repaymentDurationMonths: parseInt(data.repaymentDurationMonths),
        guarantorActiveLoanLimit: parseInt(data.guarantorActiveLoanLimit || 3),
        isEnabled: data.isEnabled ?? true,
        createdById: session.user.id,
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error creating loan category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { categoryId, ...data } = await request.json()

    const category = await prisma.loanCategory.update({
      where: { id: categoryId },
      data: {
        name: data.name,
        description: data.description,
        maxLoanAmount: data.maxLoanAmount ? parseFloat(data.maxLoanAmount) : undefined,
        monthlyInterestRate: data.monthlyInterestRate ? parseFloat(data.monthlyInterestRate) : undefined,
        repaymentDurationMonths: data.repaymentDurationMonths ? parseInt(data.repaymentDurationMonths) : undefined,
        guarantorActiveLoanLimit: data.guarantorActiveLoanLimit ? parseInt(data.guarantorActiveLoanLimit) : undefined,
        isEnabled: data.isEnabled,
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating loan category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}
