import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/lib/db'
import { DriveSyncEngine } from '@/lib/google-drive-sync'
import { setSyncState, getSyncState } from '@/lib/sync-utils'

/**
 * Google Drive Push Notifications Webhook
 *
 * Receives notifications when files change in the watched Drive folder.
 * Handles file additions, deletions, renames, and moves.
 */

// Verify the webhook is from Google
function verifyGoogleWebhook(): boolean {
  const headersList = headers()
  const channelId = headersList.get('x-goog-channel-id')
  const resourceState = headersList.get('x-goog-resource-state')

  return !!(channelId && resourceState)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    // Verify webhook source
    if (!verifyGoogleWebhook()) {
      return NextResponse.json({ error: 'Invalid webhook' }, { status: 401 })
    }

    const headersList = headers()
    const resourceState = headersList.get('x-goog-resource-state')
    const channelId = headersList.get('x-goog-channel-id')
    const resourceId = headersList.get('x-goog-resource-id')

    console.log(`[Webhook] Received: ${resourceState}`, {
      channelId,
      resourceId,
      resourceState
    })

    // Handle initial sync confirmation (not an actual change)
    if (resourceState === 'sync') {
      return NextResponse.json({ status: 'ok' })
    }

    // Create sync log
    const syncLog = await prisma.syncLog.create({
      data: {
        status: 'started',
        syncType: 'incremental',
      }
    })

    // Get saved page token from database
    const lastPageToken = await getSyncState('drive_page_token')

    if (!lastPageToken) {
      console.warn('[Webhook] No saved page token found. Skipping sync — run a full sync first.')
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'failed',
          errors: 'No page token available. Run a full sync first.',
          completedAt: new Date(),
        }
      })
      return NextResponse.json({ status: 'no_page_token' })
    }

    // Initialize sync engine
    const syncEngine = new DriveSyncEngine(process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN)

    let totalProcessed = 0
    const allErrors: string[] = []
    let nextPageToken: string | null = lastPageToken

    // Process all pages of changes
    while (nextPageToken) {
      const { changes, nextPageToken: newToken } = await syncEngine.watchChanges(nextPageToken)

      if (changes.length > 0) {
        const { processed, errors } = await syncEngine.processChanges(changes)
        totalProcessed += processed
        allErrors.push(...errors)
        console.log(`[Webhook] Processed ${processed} changes (${errors.length} errors)`)
      }

      // Save the new page token to database for next webhook call
      if (newToken) {
        await setSyncState('drive_page_token', newToken)
      }

      nextPageToken = newToken
    }

    // Update sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: allErrors.length > 0 ? 'completed_with_errors' : 'completed',
        itemsSynced: totalProcessed,
        errors: allErrors.length > 0 ? allErrors.join('\n') : null,
        completedAt: new Date(),
      }
    })

    return NextResponse.json({
      status: 'processed',
      processed: totalProcessed,
      errors: allErrors.length > 0 ? allErrors : undefined
    })

  } catch (error) {
    console.error('[Webhook] Processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Handle webhook verification from Google
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const challenge = searchParams.get('hub.challenge')

  if (challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  return NextResponse.json({ status: 'ok' })
}
