import prisma from '@/lib/db'

/**
 * Utility functions for sync operations
 */

/**
 * Get or set a sync state value
 */
export async function getSyncState(key: string): Promise<string | null> {
  const state = await prisma.syncState.findUnique({
    where: { key }
  })
  return state?.value || null
}

export async function setSyncState(key: string, value: string): Promise<void> {
  await prisma.syncState.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  })
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

/**
 * Check if a URL is reachable
 */
export async function isUrlReachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Validate Google Drive file ID
 */
export function isValidDriveId(id: string): boolean {
  // Google Drive IDs are typically 33 characters long and alphanumeric
  return /^[a-zA-Z0-9_-]{20,}$/.test(id)
}

/**
 * Clean up orphaned records
 */
export async function cleanupOrphanedRecords(): Promise<{
  stickersDeleted: number
  collectionsDeleted: number
}> {
  // Find stickers with invalid or missing source URLs
  const orphanedStickers = await prisma.sticker.findMany({
    where: {
      OR: [
        { sourceUrl: '' },
        { thumbnailUrl: '' },
        { driveId: null }
      ]
    }
  })

  let stickersDeleted = 0
  for (const sticker of orphanedStickers) {
    try {
      // Verify if the drive file still exists
      if (sticker.driveId && !await isUrlReachable(sticker.sourceUrl)) {
        await prisma.sticker.delete({ where: { id: sticker.id } })
        stickersDeleted++
      }
    } catch (error) {
      console.error(`Error cleaning up sticker ${sticker.id}:`, error)
    }
  }

  // Find empty collections
  const emptyCollections = await prisma.collection.findMany({
    where: {
      stickers: {
        none: {}
      }
    }
  })

  const collectionsDeleted = emptyCollections.length
  if (collectionsDeleted > 0) {
    await prisma.collection.deleteMany({
      where: {
        id: { in: emptyCollections.map(c => c.id) }
      }
    })
  }

  return { stickersDeleted, collectionsDeleted }
}