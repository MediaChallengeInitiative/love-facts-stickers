import { NextResponse } from 'next/server'
import { clearImageCache } from '@/lib/image-cache'

export const dynamic = 'force-dynamic'

/**
 * POST /api/cache/clear — Clear the server-side image cache
 * Called automatically after sync operations complete.
 */
export async function POST() {
  try {
    clearImageCache()
    return NextResponse.json({ status: 'cleared', timestamp: new Date().toISOString() })
  } catch (error) {
    console.error('[Cache Clear] Error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
