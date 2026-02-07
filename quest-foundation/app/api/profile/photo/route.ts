import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'

export const runtime = 'nodejs'

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Configure Cloudinary if credentials are provided
const USE_CLOUDINARY = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

if (USE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check DB role (not cached session)
    const dbUser = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const targetUserId = (formData.get('userId') as string | null) || session.user.id

    // Only admins can upload for another user
    if (targetUserId !== session.user.id && dbUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify target user's profile exists
    const targetProfile = await prisma.profile.findUnique({ where: { userId: targetUserId } })
    if (!targetProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!file || typeof file !== 'object' || !('arrayBuffer' in file)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 2MB.' },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let publicUrl: string

    if (USE_CLOUDINARY) {
      // Upload to Cloudinary
      try {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'quest-foundation/profile-photos',
              public_id: `user-${targetUserId}-${Date.now()}`,
              resource_type: 'image',
              transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result)
            },
          )
          uploadStream.end(buffer)
        })

        publicUrl = uploadResult.secure_url
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError)
        return NextResponse.json({ error: 'Failed to upload to cloud storage' }, { status: 500 })
      }
    } else {
      // Local file system upload (development only)
      const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profile-photos')
      await mkdir(uploadsDir, { recursive: true })

      const fileName = `${targetUserId}-${Date.now()}.${extension}`
      const filePath = path.join(uploadsDir, fileName)

      await writeFile(filePath, buffer)
      publicUrl = `/uploads/profile-photos/${fileName}`
    }

    const profile = await prisma.profile.update({
      where: { userId: targetUserId },
      data: {
        profilePhotoUrl: publicUrl,
      },
    })

    return NextResponse.json({ profilePhotoUrl: profile.profilePhotoUrl })
  } catch (error) {
    console.error('Error uploading profile photo:', error)
    return NextResponse.json({ error: 'Failed to upload profile photo' }, { status: 500 })
  }
}

