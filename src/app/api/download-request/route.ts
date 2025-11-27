import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { downloadRequestSchema } from '@/lib/validation'
import { generatePresignedDownloadUrl } from '@/lib/s3'
import { getClientIp } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = downloadRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { stickerId, email, phone, name, downloadType, isAnonymous } = validationResult.data

    // Get sticker details
    const sticker = await prisma.sticker.findUnique({
      where: { id: stickerId },
      include: {
        collection: true,
      },
    })

    if (!sticker) {
      return NextResponse.json(
        { error: 'Sticker not found' },
        { status: 404 }
      )
    }

    // Get client info
    const ipAddress = getClientIp(request)
    const userAgent = request.headers.get('user-agent')
    const referrer = request.headers.get('referer')

    // Create download record
    const download = await prisma.download.create({
      data: {
        stickerId,
        userEmail: email || null,
        userPhone: phone || null,
        userName: name || null,
        ipAddress,
        userAgent,
        referrer,
        isAnonymous,
        downloadType,
        status: 'completed',
      },
    })

    // Generate download URL
    let downloadUrl: string

    if (process.env.AWS_ACCESS_KEY_ID) {
      // Use presigned URL for S3
      const s3Key = sticker.sourceUrl.replace(`${process.env.S3_BUCKET_URL}/`, '')
      downloadUrl = await generatePresignedDownloadUrl(s3Key, 3600)
    } else {
      // Use public URL for local development
      downloadUrl = sticker.sourceUrl
    }

    return NextResponse.json({
      success: true,
      downloadId: download.id,
      downloadUrl,
      sticker: {
        id: sticker.id,
        title: sticker.title,
        filename: sticker.filename,
      },
    })
  } catch (error) {
    console.error('Download request error:', error)
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    )
  }
}
