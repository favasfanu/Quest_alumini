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
  if (!dbUser || dbUser.role !== 'ADMIN') {
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

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  if (!dbUser || dbUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId, updates } = await request.json()
    console.log('PATCH /api/admin/users called by', session?.user?.id, 'role', session?.user?.role, 'payload:', { userId, updates })

    const oldUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!oldUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent self-lockout
    if (session.user.id === userId) {
      if (updates?.role && updates.role !== 'ADMIN') {
        return NextResponse.json({ error: 'You cannot remove your own admin role' }, { status: 400 })
      }
      if (updates?.status && updates.status === 'DISABLED') {
        return NextResponse.json({ error: 'You cannot disable your own account' }, { status: 400 })
      }
    }

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

    // Log explicit role assignment events (in addition to UPDATE_USER)
    if (updates?.role && oldUser.role !== user.role) {
      const roleFrom = oldUser.role
      const roleTo = user.role

      const isAdminAssignment = roleTo === 'ADMIN' || roleFrom === 'ADMIN'
      const isLoanManagerAssignment = roleTo === 'LOAN_MANAGER' || roleFrom === 'LOAN_MANAGER'

      if (isAdminAssignment) {
        await createAuditLog({
          userId: session.user.id,
          action: roleTo === 'ADMIN' ? 'ADMIN_ROLE_ASSIGNED' : 'ADMIN_ROLE_REVOKED',
          entityType: 'User',
          entityId: userId,
          oldValues: { role: roleFrom },
          newValues: { role: roleTo },
        })
      }

      if (isLoanManagerAssignment) {
        await createAuditLog({
          userId: session.user.id,
          action: roleTo === 'LOAN_MANAGER' ? 'LOAN_MANAGER_ROLE_ASSIGNED' : 'LOAN_MANAGER_ROLE_REVOKED',
          entityType: 'User',
          entityId: userId,
          oldValues: { role: roleFrom },
          newValues: { role: roleTo },
        })
      }
    }

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
