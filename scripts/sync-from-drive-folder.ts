/**
 * Sync Stickers from Public Google Drive Folder
 *
 * This script syncs stickers from a public Google Drive folder
 * by scraping the folder page (no API key required if folder is public).
 *
 * IMPORTANT: The Google Drive folder must be set to "Anyone with the link can view"
 *
 * Usage:
 *   npx tsx scripts/sync-from-drive-folder.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Main folder ID from environment or default
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1ejvH2Dgo41jYv7V247XLQSqbHkKFbNkq'

// Helper to generate proxy URLs
function getDriveProxyUrl(fileId: string): string {
  return `/api/image/${fileId}`
}

function getDriveProxyThumbnailUrl(fileId: string): string {
  return `/api/image/${fileId}?size=400`
}

interface FileInfo {
  id: string
  name: string
  mimeType: string
}

interface FolderInfo {
  id: string
  name: string
}

/**
 * Fetch files from a public Google Drive folder by scraping the embed page
 */
async function fetchPublicFolderContents(folderId: string): Promise<{ files: FileInfo[], folders: FolderInfo[] }> {
  const files: FileInfo[] = []
  const folders: FolderInfo[] = []

  try {
    // Fetch the folder embed page
    const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}`
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch folder: ${response.status}`)
    }

    const html = await response.text()

    // Extract file IDs and names from the page
    // Look for patterns like: ["FILE_ID","FILENAME",...]
    const filePattern = /\["([a-zA-Z0-9_-]{25,})","([^"]+)",/g
    let match

    while ((match = filePattern.exec(html)) !== null) {
      const [, id, name] = match

      // Determine if it's a folder or file based on extension
      const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name)
      const isFolder = !name.includes('.')

      if (isImage) {
        files.push({
          id,
          name,
          mimeType: 'image/' + (name.split('.').pop()?.toLowerCase() || 'png'),
        })
      } else if (isFolder) {
        folders.push({ id, name })
      }
    }

    // Also try alternative patterns for newer Drive layouts
    const altPattern = /"([a-zA-Z0-9_-]{25,45})","([^"]+\.(png|jpg|jpeg|gif|webp))"/gi
    while ((match = altPattern.exec(html)) !== null) {
      const [, id, name] = match
      if (!files.some(f => f.id === id)) {
        files.push({
          id,
          name,
          mimeType: 'image/' + (name.split('.').pop()?.toLowerCase() || 'png'),
        })
      }
    }

  } catch (error) {
    console.error(`Error fetching folder ${folderId}:`, error)
  }

  return { files, folders }
}

/**
 * Alternative: Use the Google Drive JSON endpoint (works for some public folders)
 */
async function fetchFolderViaJson(folderId: string): Promise<{ files: FileInfo[], folders: FolderInfo[] }> {
  const files: FileInfo[] = []
  const folders: FolderInfo[] = []

  try {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&fields=files(id,name,mimeType)&key=`

    // Try without API key for public folders (usually doesn't work, but worth trying)
    const response = await fetch(url)

    if (response.ok) {
      const data = await response.json()
      for (const file of data.files || []) {
        if (file.mimeType?.startsWith('image/')) {
          files.push(file)
        } else if (file.mimeType === 'application/vnd.google-apps.folder') {
          folders.push({ id: file.id, name: file.name })
        }
      }
    }
  } catch (error) {
    // Silently fail - this method often doesn't work without API key
  }

  return { files, folders }
}

function generateTags(title: string): string[] {
  const words = title.toLowerCase().split(/[\s_-]+/)
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
  return words
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, 5)
}

async function syncFromDrive() {
  console.log('Syncing stickers from Google Drive...\n')
  console.log(`Folder ID: ${DRIVE_FOLDER_ID}\n`)

  // First, clear existing seeded stickers (ones without driveId)
  const deleted = await prisma.sticker.deleteMany({
    where: { driveId: null },
  })
  console.log(`Cleared ${deleted.count} sample stickers\n`)

  // Try to fetch the main folder contents
  let { files, folders } = await fetchPublicFolderContents(DRIVE_FOLDER_ID)

  console.log(`Found ${files.length} files and ${folders.length} subfolders\n`)

  let totalSynced = 0

  if (folders.length > 0) {
    // Process subfolders as collections
    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i]
      const slug = folder.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      console.log(`\nProcessing collection: ${folder.name}`)

      // Create/update collection
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
      const { files: folderFiles } = await fetchPublicFolderContents(folder.id)
      console.log(`  Found ${folderFiles.length} stickers`)

      for (const file of folderFiles) {
        const title = file.name.replace(/\.(png|jpg|jpeg|gif|webp|svg)$/i, '').replace(/[-_]/g, ' ')

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
        console.log(`    ✓ ${title}`)
        totalSynced++
      }
    }
  } else if (files.length > 0) {
    // No subfolders, use main folder as single collection
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

    for (const file of files) {
      const title = file.name.replace(/\.(png|jpg|jpeg|gif|webp|svg)$/i, '').replace(/[-_]/g, ' ')

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
          collectionId: collection.id,
          tags: generateTags(title),
          caption: `${title} - Share to spread media literacy!`,
        },
      })
      console.log(`  ✓ ${title}`)
      totalSynced++
    }
  } else {
    console.log('\n⚠️  Could not find any files or folders.')
    console.log('Please ensure:')
    console.log('1. The Google Drive folder is set to "Anyone with the link can view"')
    console.log('2. The folder ID is correct:', DRIVE_FOLDER_ID)
    console.log('\nAlternatively, get a Google API key and set it in .env as GOOGLE_API_KEY')
  }

  console.log(`\n✅ Synced ${totalSynced} stickers from Google Drive`)
}

syncFromDrive()
  .catch((e) => {
    console.error('Sync failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
