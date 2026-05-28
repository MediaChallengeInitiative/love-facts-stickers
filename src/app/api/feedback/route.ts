import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { feedbackSchema } from '@/lib/validation'
import { getClientIp, hashIp } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = feedbackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 })
    }
    const ipHash = hashIp(getClientIp(request))

    await prisma.feedback.create({
      data: {
        sentiment: parsed.data.sentiment,
        missing: parsed.data.missing,
        channel: parsed.data.channel,
        stickerId: parsed.data.stickerId,
        ipHash,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback error:', error)
    // Never block — feedback is best-effort
    return NextResponse.json({ success: true })
  }
}
