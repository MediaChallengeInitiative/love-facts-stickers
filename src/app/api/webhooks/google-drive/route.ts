import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/lib/db'
import { DriveSyncEngine } from '@/lib/google-drive-sync'

/**
 * Google Drive Push Notifications Webhook
 * 
 * Receives notifications when files change in the watched Drive folder
 */

// Verify the webhook is from Google
function verifyGoogleWebhook(): boolean {
  const headersList = headers()
  const channelId = headersList.get('x-goog-channel-id')
  const resourceState = headersList.get('x-goog-resource-state')
  
  // Basic verification - in production, implement proper verification
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

    console.log(`Received Google Drive webhook: ${resourceState}`, {
      channelId,
      resourceId,
      resourceState
    })

    // Handle sync notification (not the initial sync message)
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

    // Get saved page token (in production, store this in DB)
    const lastPageToken = process.env.GOOGLE_DRIVE_PAGE_TOKEN || ''

    // Initialize sync engine
    const syncEngine = new DriveSyncEngine(process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN)
    
    // Watch for changes
    const { changes, nextPageToken } = await syncEngine.watchChanges(lastPageToken)
    
    // Process changes
    const { processed, errors } = await syncEngine.processChanges(changes)

    // Update sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        itemsSynced: processed,
        errors: errors.length > 0 ? errors.join('\n') : null,
        completedAt: new Date(),
      }
    })

    // In production, save nextPageToken to database
    if (nextPageToken) {
      // Save for next sync
      console.log('Next page token:', nextPageToken)
    }

    return NextResponse.json({
      status: 'processed',
      processed,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
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
    // Echo back the challenge for webhook verification
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  return NextResponse.json({ status: 'ok' })
}