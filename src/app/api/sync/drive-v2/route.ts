import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { DriveSyncEngine } from '@/lib/google-drive-sync'
import { v4 as uuidv4 } from 'uuid'

/**
 * Enhanced Google Drive Sync API
 * 
 * POST /api/sync/drive-v2
 * - Performs full or incremental sync
 * - Sets up webhook for automatic sync
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullSync = false, setupWebhook = false } = body

    // Create sync log
    const syncLog = await prisma.syncLog.create({
      data: {
        status: 'started',
        syncType: fullSync ? 'full' : 'incremental',
      }
    })

    const syncEngine = new DriveSyncEngine(process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN)
    
    let itemsSynced = 0
    const errors: string[] = []

    try {
      // Initialize page token
      const pageToken = await syncEngine.initializePageToken()

      // Get all changes
      let nextPageToken: string | null = pageToken
      
      while (nextPageToken) {
        const { changes, nextPageToken: newToken } = await syncEngine.watchChanges(nextPageToken)
        const { processed, errors: changeErrors } = await syncEngine.processChanges(changes)
        
        itemsSynced += processed
        errors.push(...changeErrors)
        
        nextPageToken = newToken
      }

      // Setup webhook if requested
      if (setupWebhook && process.env.NEXT_PUBLIC_APP_URL) {
        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/google-drive`
        const channelId = uuidv4()
        
        try {
          await syncEngine.setupWebhook(webhookUrl, channelId)
          console.log('Webhook setup successful:', { webhookUrl, channelId })
        } catch (webhookError) {
          errors.push(`Failed to setup webhook: ${webhookError}`)
        }
      }

      // Update sync log
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: errors.length > 0 ? 'completed_with_errors' : 'completed',
          itemsSynced,
          errors: errors.length > 0 ? errors.join('\n') : null,
          completedAt: new Date(),
        }
      })

      return NextResponse.json({
        success: true,
        syncLogId: syncLog.id,
        itemsSynced,
        errors: errors.length > 0 ? errors : undefined,
        webhookSetup: setupWebhook
      })

    } catch (error) {
      // Update sync log with failure
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'failed',
          errors: String(error),
          completedAt: new Date(),
        }
      })
      throw error
    }

  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync from Google Drive', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/sync/drive-v2/status
 * Get current sync status and configuration
 */
export async function GET() {
  try {
    // Get recent sync logs
    const recentSyncs = await prisma.syncLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 5,
    })

    // Get stats
    const totalStickers = await prisma.sticker.count()
    const totalCollections = await prisma.collection.count()

    return NextResponse.json({
      status: 'ok',
      stats: {
        totalStickers,
        totalCollections,
      },
      recentSyncs,
      webhookEnabled: !!process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN,
    })

  } catch (error) {
    console.error('Error getting sync status:', error)
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    )
  }
}