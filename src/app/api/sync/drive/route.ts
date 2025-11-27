import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import {
  fetchDriveFiles,
  fetchDriveFolders,
  getDriveProxyUrl,
  getDriveProxyThumbnailUrl,
  DRIVE_FOLDER_ID,
} from '@/lib/google-drive'

/**
 * Sync stickers from Google Drive to the database
 *
 * The Drive folder structure should be:
 * - Main folder (GOOGLE_DRIVE_FOLDER_ID)
 *   - Collection 1 (subfolder)
 *     - sticker1.png
 *     - sticker2.png
 *   - Collection 2 (subfolder)
 *     - sticker3.png
 *
 * POST /api/sync/drive - Start a sync operation
 */
export async function POST() {
  try {
    // Check for API key or admin auth
    const apiKey = process.env.GOOGLE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google API key not configured. Please set GOOGLE_API_KEY in .env' },
        { status: 400 }
      )
    }

    // Create sync log entry
    const syncLog = await prisma.syncLog.create({
      data: {
        status: 'started',
        syncType: 'full',
      },
    })

    let itemsSynced = 0
    const errors: string[] = []

    // First, fetch all subfolders (collections)
    const folders = await fetchDriveFolders(DRIVE_FOLDER_ID, apiKey)

    if (folders.length === 0) {
      // If no subfolders, treat the main folder as a single collection
      const files = await fetchDriveFiles(DRIVE_FOLDER_ID, apiKey)

      // Create or update default collection
      const defaultCollection = await prisma.collection.upsert({
        where: { slug: 'all-stickers' },
        update: { driveFolderId: DRIVE_FOLDER_ID },
        create: {
          name: 'All Stickers',
          slug: 'all-stickers',
          description: 'Love Facts media literacy stickers',
          driveFolderId: DRIVE_FOLDER_ID,
          sortOrder: 1,
        },
      })

      // Sync files in main folder
      for (const file of files) {
        try {
          const title = file.name.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '').replace(/[-_]/g, ' ')

          await prisma.sticker.upsert({
            where: { driveId: file.id },
            update: {
              title,
              filename: file.name,
              sourceUrl: getDriveProxyUrl(file.id),
              thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
            },
            create: {
              title,
              filename: file.name,
              driveId: file.id,
              sourceUrl: getDriveProxyUrl(file.id),
              thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
              collectionId: defaultCollection.id,
              tags: generateTags(title),
              caption: `${title} - Share to spread media literacy!`,
            },
          })
          itemsSynced++
        } catch (err) {
          errors.push(`Failed to sync ${file.name}: ${err}`)
        }
      }
    } else {
      // Process each subfolder as a collection
      for (let i = 0; i < folders.length; i++) {
        const folder = folders[i]
        const slug = folder.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

        // Create or update collection
        const collection = await prisma.collection.upsert({
          where: { slug },
          update: {
            name: folder.name,
            driveFolderId: folder.id,
          },
          create: {
            name: folder.name,
            slug,
            description: `${folder.name} stickers`,
            driveFolderId: folder.id,
            sortOrder: i + 1,
          },
        })

        // Fetch files in this folder
        const files = await fetchDriveFiles(folder.id, apiKey)

        for (const file of files) {
          try {
            const title = file.name.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '').replace(/[-_]/g, ' ')

            await prisma.sticker.upsert({
              where: { driveId: file.id },
              update: {
                title,
                filename: file.name,
                sourceUrl: getDriveProxyUrl(file.id),
                thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
                collectionId: collection.id,
              },
              create: {
                title,
                filename: file.name,
                driveId: file.id,
                sourceUrl: getDriveProxyUrl(file.id),
                thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
                collectionId: collection.id,
                tags: generateTags(title),
                caption: `${title} - Share to spread media literacy!`,
              },
            })
            itemsSynced++
          } catch (err) {
            errors.push(`Failed to sync ${file.name}: ${err}`)
          }
        }
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
      },
    })

    return NextResponse.json({
      success: true,
      itemsSynced,
      errors: errors.length > 0 ? errors : undefined,
      syncLogId: syncLog.id,
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync from Google Drive' },
      { status: 500 }
    )
  }
}

/**
 * Generate tags from a sticker title
 */
function generateTags(title: string): string[] {
  const words = title.toLowerCase().split(/\s+/)
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  return words
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 5)
}

/**
 * GET /api/sync/drive - Get sync status and history
 */
export async function GET() {
  try {
    const syncLogs = await prisma.syncLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 10,
    })

    return NextResponse.json({ syncLogs })
  } catch (error) {
    console.error('Error fetching sync logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync logs' },
      { status: 500 }
    )
  }
}
