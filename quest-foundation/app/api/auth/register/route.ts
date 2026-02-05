import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  userType: z.enum(['ALUMNI', 'STAFF', 'NON_ALUMNI']),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    const passwordHash = await hashPassword(validatedData.password)

    let role
    if (validatedData.userType === 'ALUMNI') {
      role = 'ALUMNI_MEMBER'
    } else if (validatedData.userType === 'STAFF') {
      role = 'QUEST_STAFF'
    } else {
      role = 'NON_ALUMNI_MEMBER'
    }

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        userType: validatedData.userType,
        role,
        status: 'PENDING',
        profile: {
          create: {
            fullName: validatedData.fullName,
            privacySettings: {
              create: {
                familyDetailsVisible: false,
                educationVisible: false,
                jobHistoryVisible: false,
                currentJobVisible: true,
                contactDetailsVisible: true,
              },
            },
          },
        },
      },
      include: {
        profile: true,
      },
    })

    return NextResponse.json({
      message: 'Registration successful. Please wait for admin approval.',
      user: {
        id: user.id,
        email: user.email,
        status: user.status,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}
