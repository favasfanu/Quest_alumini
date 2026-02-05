import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.loanCategory.findMany({
      where: { isEnabled: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching loan categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
