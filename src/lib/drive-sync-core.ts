import prisma from '@/lib/db'
import {
  fetchDriveFiles,
  fetchDriveFolders,
  getDriveProxyUrl,
  getDriveProxyThumbnailUrl,
  DRIVE_FOLDER_ID,
  type DriveFile,
} from '@/lib/google-drive'

/**
 * Drive → database sync core.
 *
 * Mirrors the Drive folder structure 1:1:
 *   - Each SUBFOLDER becomes a Collection (category).
 *   - Images placed directly in the ROOT folder go into an "Uncategorized"
 *     collection so nothing is ever orphaned.
 *
 * Idempotent: upserts by `driveId` / `driveFolderId`, removes stickers that no
 * longer exist in their Drive folder, and never duplicates collections. Shared
 * by `/api/sync/auto` (on-load) and `/api/sync/cron` (safety-net poller).
 */

export interface DriveSyncResult {
  itemsSynced: number
  errors: string[]
  affectedSlugs: string[]
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function titleFromFilename(name: string): string {
  return name.replace(/\.(png|jpg|jpeg|gif|webp|svg)$/i, '').replace(/[-_]/g, ' ').trim()
}

function generateTags(title: string): string[] {
  const words = title.toLowerCase().split(/\s+/)
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  return words.filter((word) => word.length > 2 && !commonWords.includes(word)).slice(0, 5)
}

/**
 * Upsert every file into a collection and prune stickers that vanished from
 * Drive. Returns the count synced (so deletions surface as data changes too).
 */
async function syncFilesIntoCollection(
  collectionId: string,
  files: DriveFile[],
  errors: string[]
): Promise<number> {
  let synced = 0
  const activeDriveIds = new Set<string>()

  for (const file of files) {
    try {
      activeDriveIds.add(file.id)
      const title = titleFromFilename(file.name)
      await prisma.sticker.upsert({
        where: { driveId: file.id },
        update: {
          title,
          filename: file.name,
          sourceUrl: getDriveProxyUrl(file.id),
          thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
          collectionId,
          tags: generateTags(title),
          caption: `${title} - Share to spread media literacy!`,
        },
        create: {
          title,
          filename: file.name,
          driveId: file.id,
          sourceUrl: getDriveProxyUrl(file.id),
          thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
          collectionId,
          tags: generateTags(title),
          caption: `${title} - Share to spread media literacy!`,
        },
      })
      synced++
    } catch (err) {
      errors.push(`${file.name}: ${err}`)
    }
  }

  // Remove stickers no longer present in this Drive folder (handles deletions).
  const stale = await prisma.sticker.findMany({
    where: { collectionId, driveId: { notIn: Array.from(activeDriveIds) } },
    select: { id: true },
  })
  if (stale.length > 0) {
    await prisma.sticker.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } })
    console.log(`[Drive sync] Removed ${stale.length} stale sticker(s) from collection ${collectionId}`)
  }

  return synced
}

/** Set a collection's cover image from its first sticker when it has none. */
async function ensureCoverImage(collectionId: string): Promise<void> {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { coverImage: true },
  })
  if (collection?.coverImage) return

  const first = await prisma.sticker.findFirst({
    where: { collectionId },
    orderBy: { createdAt: 'asc' },
    select: { thumbnailUrl: true },
  })
  if (first?.thumbnailUrl) {
    await prisma.collection.update({
      where: { id: collectionId },
      data: { coverImage: first.thumbnailUrl },
    })
  }
}

/**
 * Run a full Drive → DB sync. `apiKey` is the Google API key (public-folder
 * read access). Returns counts plus the slugs of every collection touched so
 * callers can revalidate the matching pages.
 */
export async function syncDriveToDatabase(apiKey: string): Promise<DriveSyncResult> {
  const errors: string[] = []
  const affectedSlugs = new Set<string>()
  let itemsSynced = 0

  const folders = await fetchDriveFolders(DRIVE_FOLDER_ID, apiKey)

  if (folders.length === 0) {
    // Flat structure: one "All Stickers" collection holding the root images.
    const files = await fetchDriveFiles(DRIVE_FOLDER_ID, apiKey)
    const collection = await prisma.collection.upsert({
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
    itemsSynced += await syncFilesIntoCollection(collection.id, files, errors)
    await ensureCoverImage(collection.id)
    affectedSlugs.add(collection.slug)
    return { itemsSynced, errors, affectedSlugs: Array.from(affectedSlugs) }
  }

  // Categorised structure: each subfolder is a collection.
  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i]
    const baseSlug = slugify(folder.name)

    // Find existing by driveFolderId so renames update in place (no dupes).
    let collection = await prisma.collection.findUnique({ where: { driveFolderId: folder.id } })

    if (collection) {
      const nextSlug = collection.name !== folder.name ? baseSlug : collection.slug
      const conflict =
        nextSlug !== collection.slug
          ? await prisma.collection.findUnique({ where: { slug: nextSlug } })
          : null
      const finalSlug = conflict ? `${nextSlug}-${folder.id.substring(0, 6)}` : nextSlug
      collection = await prisma.collection.update({
        where: { id: collection.id },
        data: {
          name: folder.name,
          slug: finalSlug,
          description: collection.description || `${folder.name} stickers`,
          // Keep sortOrder stable across syncs — only set it once on create.
        },
      })
    } else {
      const conflict = await prisma.collection.findUnique({ where: { slug: baseSlug } })
      const finalSlug = conflict ? `${baseSlug}-${folder.id.substring(0, 6)}` : baseSlug
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

    const files = await fetchDriveFiles(folder.id, apiKey)
    itemsSynced += await syncFilesIntoCollection(collection.id, files, errors)
    await ensureCoverImage(collection.id)
    affectedSlugs.add(collection.slug)
  }

  // Loose images dropped directly in the root folder → "Uncategorized" so they
  // are never lost when subfolders also exist.
  const rootFiles = await fetchDriveFiles(DRIVE_FOLDER_ID, apiKey)
  if (rootFiles.length > 0) {
    const uncategorized = await prisma.collection.upsert({
      where: { slug: 'uncategorized' },
      update: {},
      create: {
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Stickers not yet sorted into a collection',
        sortOrder: 999,
      },
    })
    itemsSynced += await syncFilesIntoCollection(uncategorized.id, rootFiles, errors)
    await ensureCoverImage(uncategorized.id)
    affectedSlugs.add(uncategorized.slug)
  }

  return { itemsSynced, errors, affectedSlugs: Array.from(affectedSlugs) }
}
