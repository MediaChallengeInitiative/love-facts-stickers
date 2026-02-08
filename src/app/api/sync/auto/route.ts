import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import {
  fetchDriveFiles,
  fetchDriveFolders,
  getDriveProxyUrl,
  getDriveProxyThumbnailUrl,
  DRIVE_FOLDER_ID,
} from '@/lib/google-drive'
import { clearImageCache } from '@/lib/image-cache'

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
    let itemsSynced = 0
    const errors: string[] = []

    try {
      // Fetch folders (collections) from Drive
      const folders = await fetchDriveFolders(DRIVE_FOLDER_ID, apiKey)

      if (folders.length === 0) {
        // Single flat folder
        const files = await fetchDriveFiles(DRIVE_FOLDER_ID, apiKey)

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

        for (const file of files) {
          try {
            const title = file.name.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '').replace(/[-_]/g, ' ')
            const tags = generateTags(title)

            await prisma.sticker.upsert({
              where: { driveId: file.id },
              update: {
                title,
                filename: file.name,
                sourceUrl: getDriveProxyUrl(file.id),
                thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
                tags,
                caption: `${title} - Share to spread media literacy!`,
              },
              create: {
                title,
                filename: file.name,
                driveId: file.id,
                sourceUrl: getDriveProxyUrl(file.id),
                thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
                collectionId: defaultCollection.id,
                tags,
                caption: `${title} - Share to spread media literacy!`,
              },
            })
            itemsSynced++
          } catch (err) {
            errors.push(`${file.name}: ${err}`)
          }
        }
      } else {
        // Process subfolders as collections
        for (let i = 0; i < folders.length; i++) {
          const folder = folders[i]
          const slug = folder.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

          // Find existing collection by driveFolderId (handles renames)
          let collection = await prisma.collection.findUnique({
            where: { driveFolderId: folder.id },
          })

          if (collection) {
            // Update existing (handles renames)
            const newSlug = collection.name !== folder.name ? slug : collection.slug
            const slugConflict = newSlug !== collection.slug
              ? await prisma.collection.findUnique({ where: { slug: newSlug } })
              : null
            const finalSlug = slugConflict ? `${newSlug}-${folder.id.substring(0, 6)}` : newSlug

            collection = await prisma.collection.update({
              where: { id: collection.id },
              data: {
                name: folder.name,
                slug: finalSlug,
                description: `${folder.name} stickers`,
                sortOrder: i + 1,
              },
            })
          } else {
            const slugConflict = await prisma.collection.findUnique({ where: { slug } })
            const finalSlug = slugConflict ? `${slug}-${folder.id.substring(0, 6)}` : slug

            collection = await prisma.collection.create({
              data: {
                name: folder.name,
                slug: finalSlug,
                description: `${folder.name} stickers`,
                driveFolderId: folder.id,
                sortOrder: i + 1,
              },
            })
          }

          // Fetch and sync files in this folder
          const files = await fetchDriveFiles(folder.id, apiKey)

          // Track which driveIds exist in this folder for cleanup
          const activeDriveIds = new Set<string>()

          for (const file of files) {
            try {
              activeDriveIds.add(file.id)
              const title = file.name.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '').replace(/[-_]/g, ' ')
              const tags = generateTags(title)

              await prisma.sticker.upsert({
                where: { driveId: file.id },
                update: {
                  title,
                  filename: file.name,
                  sourceUrl: getDriveProxyUrl(file.id),
                  thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
                  collectionId: collection.id,
                  tags,
                  caption: `${title} - Share to spread media literacy!`,
                },
                create: {
                  title,
                  filename: file.name,
                  driveId: file.id,
                  sourceUrl: getDriveProxyUrl(file.id),
                  thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
                  collectionId: collection.id,
                  tags,
                  caption: `${title} - Share to spread media literacy!`,
                },
              })
              itemsSynced++
            } catch (err) {
              errors.push(`${file.name}: ${err}`)
            }
          }

          // Remove stickers that are no longer in the Drive folder
          const staleStickers = await prisma.sticker.findMany({
            where: {
              collectionId: collection.id,
              driveId: { notIn: Array.from(activeDriveIds) },
            },
            select: { id: true, driveId: true },
          })

          if (staleStickers.length > 0) {
            await prisma.sticker.deleteMany({
              where: { id: { in: staleStickers.map(s => s.id) } },
            })
            console.log(`[Auto-sync] Removed ${staleStickers.length} stale stickers from ${folder.name}`)
          }
        }
      }

      lastSyncTime = Date.now()

      // Clear the image cache so fresh images are fetched
      if (itemsSynced > 0) {
        clearImageCache()
      }

      return NextResponse.json({
        status: 'synced',
        itemsSynced,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      })
    } finally {
      isSyncing = false
    }
  } catch (error) {
    isSyncing = false
    console.error('[Auto-sync] Error:', error)
    return NextResponse.json(
      { status: 'error', error: String(error) },
      { status: 500 }
    )
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

function generateTags(title: string): string[] {
  const words = title.toLowerCase().split(/\s+/)
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  return words
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 5)
}
