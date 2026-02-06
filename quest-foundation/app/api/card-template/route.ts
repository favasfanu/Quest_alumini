import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const template = await prisma.cardTemplate.findFirst()
    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error fetching card template:', error)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can manage templates' }, { status: 403 })
  }

  try {
    const contentType = request.headers.get('content-type') || ''

    // Handle file upload (FormData)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file') as File | null

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
      }

      // Convert file to base64 data URL for storage
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`

      const template = await prisma.cardTemplate.upsert({
        where: { id: 'default' },
        update: {
          templateUrl: dataUrl,
          uploadedAt: new Date(),
          uploadedById: session.user.id,
        },
        create: {
          id: 'default',
          templateUrl: dataUrl,
          uploadedAt: new Date(),
          uploadedById: session.user.id,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      })

      return NextResponse.json({ template })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Error uploading template:', error)
    return NextResponse.json({ error: 'Failed to upload template' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can manage templates' }, { status: 403 })
  }

  try {
    const template = await prisma.cardTemplate.update({
      where: { id: 'default' },
      data: {
        templateUrl: null,
        uploadedAt: null,
      },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error removing template:', error)
    return NextResponse.json({ error: 'Failed to remove template' }, { status: 500 })
  }
}
