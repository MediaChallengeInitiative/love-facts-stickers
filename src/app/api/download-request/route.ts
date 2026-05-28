import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { downloadRequestSchema } from '@/lib/validation'
import { getClientIp, hashIp } from '@/lib/utils'

// v2: Anonymous-by-default. No gating. Fires fire-and-forget from the client.
// We accept the request, log it, return 200. Never blocks the download UX.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationResult = downloadRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { stickerId, email, phone, name, downloadType, isAnonymous, channel } = validationResult.data

    const sticker = await prisma.sticker.findUnique({
      where: { id: stickerId },
      select: { id: true },
    })

    if (!sticker) {
      return NextResponse.json({ error: 'Sticker not found' }, { status: 404 })
    }

    const ipAddress = hashIp(getClientIp(request))
    const userAgent = request.headers.get('user-agent')
    const referrer = request.headers.get('referer')

    await prisma.download.create({
      data: {
        stickerId,
        userEmail: email || null,
        userPhone: phone || null,
        userName: name || null,
        ipAddress,
        userAgent,
        referrer: channel ? `${referrer ?? ''}#channel=${channel}` : referrer,
        isAnonymous: isAnonymous ?? true,
        downloadType,
        status: 'completed',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Download request error:', error)
    return NextResponse.json({ error: 'Failed to log download' }, { status: 500 })
  }
}
