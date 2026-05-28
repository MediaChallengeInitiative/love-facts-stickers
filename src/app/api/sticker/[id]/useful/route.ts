import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Lightweight "💚 Useful" reaction. Single-tap, no auth, debounced
// per-device on the client via localStorage. Server just increments —
// the client guarantees one-per-device, which is the same threat model
// as the rest of the v2 anonymous flows.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.sticker.update({
      where: { id },
      data: { usefulCount: { increment: 1 } },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Useful track error:', error)
    return NextResponse.json({ success: true })
  }
}
