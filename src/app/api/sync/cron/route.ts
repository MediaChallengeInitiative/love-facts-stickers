import { NextRequest, NextResponse } from 'next/server'
import { syncDriveToDatabase } from '@/lib/drive-sync-core'
import { clearImageCache } from '@/lib/image-cache'
import { revalidateStickerPages } from '@/lib/revalidate'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Safety-net poller (Vercel Cron — see vercel.json).
 *
 * The Google Drive push webhook is the primary trigger; this cron runs on a
 * fixed schedule so adds/deletes still surface even if a webhook is missed or
 * the channel expires. Idempotent — reuses the same sync core as /api/sync/auto.
 *
 * Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET is
 * configured; we verify it so the endpoint can't be triggered by the public.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return NextResponse.json({ status: 'no_api_key', skipped: true })
  }

  try {
    const { itemsSynced, errors, affectedSlugs } = await syncDriveToDatabase(apiKey)

    clearImageCache()
    revalidateStickerPages(affectedSlugs)

    return NextResponse.json({
      status: 'synced',
      itemsSynced,
      affectedSlugs,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Cron sync] Error:', error)
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 })
  }
}
