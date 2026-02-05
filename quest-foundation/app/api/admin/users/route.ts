import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId, updates } = await request.json()

    const oldUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updates,
        approvedById: updates.status === 'APPROVED' ? session.user.id : undefined,
        approvedAt: updates.status === 'APPROVED' ? new Date() : undefined,
      },
      include: {
        profile: true,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: userId,
      oldValues: oldUser,
      newValues: user,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
