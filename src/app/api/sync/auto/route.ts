import { NextResponse } from 'next/server'
import { syncDriveToDatabase } from '@/lib/drive-sync-core'
import { clearImageCache } from '@/lib/image-cache'
import { revalidateStickerPages } from '@/lib/revalidate'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * Lightweight auto-sync endpoint.
 * Called automatically on page load to keep data fresh.
 *
 * Throttled: only runs if last sync was >2 minutes ago.
 * Uses the simple Drive API (no OAuth required, just API key).
 *
 * POST /api/sync/auto — trigger a sync
 * GET  /api/sync/auto — check last sync time
 */

// In-memory throttle to avoid running multiple syncs simultaneously
let lastSyncTime = 0
let isSyncing = false
const MIN_SYNC_INTERVAL = 2 * 60 * 1000 // 2 minutes between syncs

export async function POST() {
  try {
    const now = Date.now()

    // Throttle: skip if synced recently or already syncing
    if (isSyncing) {
      return NextResponse.json({ status: 'already_syncing', skipped: true })
    }
    if (now - lastSyncTime < MIN_SYNC_INTERVAL) {
      return NextResponse.json({
        status: 'throttled',
        skipped: true,
        lastSync: new Date(lastSyncTime).toISOString(),
        nextSyncIn: Math.ceil((MIN_SYNC_INTERVAL - (now - lastSyncTime)) / 1000),
      })
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ status: 'no_api_key', skipped: true })
    }

    isSyncing = true
    try {
      const { itemsSynced, errors, affectedSlugs } = await syncDriveToDatabase(apiKey)

      lastSyncTime = Date.now()

      // Refresh proxied images and rebuild cached pages so the UI reflects
      // Drive additions/deletions immediately.
      clearImageCache()
      revalidateStickerPages(affectedSlugs)

      return NextResponse.json({
        status: 'synced',
        itemsSynced,
        affectedSlugs,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      })
    } finally {
      isSyncing = false
    }
  } catch (error) {
    isSyncing = false
    console.error('[Auto-sync] Error:', error)
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  const response = NextResponse.json({
    lastSync: lastSyncTime > 0 ? new Date(lastSyncTime).toISOString() : null,
    isSyncing,
    throttleSeconds: MIN_SYNC_INTERVAL / 1000,
  })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
