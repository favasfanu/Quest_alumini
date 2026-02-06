import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const fullName = String(body.fullName || '').trim()
    const password = String(body.password || '')
    const userType = (body.userType || 'STAFF') as 'ALUMNI' | 'STAFF' | 'NON_ALUMNI'

    if (!email || !fullName || !password) {
      return NextResponse.json({ error: 'Email, full name, and password are required' }, { status: 400 })
    }

    if (password.length < 10) {
      return NextResponse.json({ error: 'Password must be at least 10 characters' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        userType,
        role: 'ADMIN',
        status: 'APPROVED',
        approvedById: session.user.id,
        approvedAt: new Date(),
        profile: {
          create: {
            fullName,
          },
        },
      },
      include: {
        profile: true,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE_ADMIN',
      entityType: 'User',
      entityId: created.id,
      newValues: {
        id: created.id,
        email: created.email,
        role: created.role,
        status: created.status,
        userType: created.userType,
        profile: { fullName: created.profile?.fullName },
      },
    })

    return NextResponse.json({ user: created }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 })
  }
}

