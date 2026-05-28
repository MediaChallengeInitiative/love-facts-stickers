import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { shareTrackSchema } from '@/lib/validation'
import { getClientIp, hashIp } from '@/lib/utils'

// Logs a share event without blocking the user. Increments the sticker's
// aggregate shareCount in the same transaction so /admin can sort hot stickers.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const parsed = shareTrackSchema.safeParse({ ...body, stickerId: id })
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
    const ipHash = hashIp(getClientIp(request))

    await prisma.$transaction([
      prisma.shareEvent.create({
        data: { stickerId: id, channel: parsed.data.channel, ipHash },
      }),
      prisma.sticker.update({
        where: { id },
        data: { shareCount: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Share track error:', error)
    // Always succeed from the client's perspective — telemetry must never block UX.
    return NextResponse.json({ success: true })
  }
}
