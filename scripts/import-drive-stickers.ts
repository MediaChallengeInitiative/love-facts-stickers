/**
 * ============================================================================
 * Import Stickers from Google Drive
 * ============================================================================
 *
 * This script imports stickers using Google Drive file IDs.
 *
 * STEP 1: Make sure images are shared publicly
 *   - Right-click the image in Google Drive
 *   - Click "Share" > "General access" > "Anyone with the link"
 *
 * STEP 2: Get the file ID from the share link
 *   - Right-click the image in Google Drive
 *   - Click "Get link"
 *   - The link format is: https://drive.google.com/file/d/FILE_ID/view
 *   - Copy the FILE_ID portion (the long string of letters and numbers)
 *
 * STEP 3: Add stickers to the COLLECTIONS array below
 *
 * STEP 4: Run this script:
 *   npx tsx scripts/import-drive-stickers.ts
 *
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to generate Google Drive proxy URLs (uses our API proxy for reliable display)
function getDriveProxyUrl(fileId: string): string {
  return `/api/image/${fileId}`
}

function getDriveProxyThumbnailUrl(fileId: string): string {
  return `/api/image/${fileId}?size=400`
}

// ============================================================================
// CONFIGURE YOUR STICKERS HERE
// ============================================================================

interface StickerConfig {
  driveId: string  // The file ID from Google Drive (the long string in the share URL)
  title: string    // Display name for the sticker
  tags?: string[]  // Optional tags for search
  caption?: string // Optional caption for sharing
}

interface CollectionConfig {
  name: string
  slug: string
  description: string
  stickers: StickerConfig[]
}

// ============================================================================
// ADD YOUR STICKERS BELOW
// ============================================================================
// Example entry:
// { driveId: '1A2B3C4D5E6F7G8H9I0J', title: 'My Sticker', tags: ['fun', 'meme'] }
//
// To add a sticker:
// 1. Get the share link for the image from Google Drive
// 2. Copy the file ID from the link (the part between /d/ and /view)
// 3. Add an entry with driveId, title, and optional tags

const COLLECTIONS: CollectionConfig[] = [
  {
    name: 'Call out Lies in a Fun Way',
    slug: 'call-out-lies',
    description: 'Fun and creative stickers to call out misinformation with humor',
    stickers: [
      // EXAMPLE (remove and replace with your stickers):
      // { driveId: '1A2B3C4D5E6F7G8H9I0JK1L2M3N4O5P6Q', title: 'Fact Check First', tags: ['fact-check', 'verify'] },
    ],
  },
  {
    name: 'Kickstart Conversations',
    slug: 'kickstart-conversations',
    description: 'Start meaningful discussions about media literacy',
    stickers: [
      // Add stickers here
    ],
  },
  {
    name: 'Respond to Misinformation',
    slug: 'respond-to-misinformation',
    description: 'Quick responses to counter false information',
    stickers: [
      // Add stickers here
    ],
  },
  {
    name: 'Shift the Vibe',
    slug: 'shift-the-vibe',
    description: 'Lighten the mood while spreading truth',
    stickers: [
      // Add stickers here
    ],
  },
  {
    name: 'Make the Truth Go Viral',
    slug: 'make-truth-viral',
    description: 'Shareable stickers to amplify accurate information',
    stickers: [
      // Add stickers here
    ],
  },
]

// ============================================================================

async function importStickers() {
  console.log('Starting sticker import from Google Drive...\n')

  let totalImported = 0

  for (let i = 0; i < COLLECTIONS.length; i++) {
    const collectionConfig = COLLECTIONS[i]

    // Skip collections with no stickers
    if (collectionConfig.stickers.length === 0) {
      console.log(`Skipping ${collectionConfig.name} (no stickers configured)`)
      continue
    }

    console.log(`\nProcessing collection: ${collectionConfig.name}`)

    // Create or update collection
    const collection = await prisma.collection.upsert({
      where: { slug: collectionConfig.slug },
      update: {
        name: collectionConfig.name,
        description: collectionConfig.description,
      },
      create: {
        name: collectionConfig.name,
        slug: collectionConfig.slug,
        description: collectionConfig.description,
        sortOrder: i + 1,
      },
    })

    console.log(`  Collection ID: ${collection.id}`)

    // Import stickers
    for (const stickerConfig of collectionConfig.stickers) {
      const filename = `${stickerConfig.title.toLowerCase().replace(/\s+/g, '-')}.png`

      try {
        await prisma.sticker.upsert({
          where: { driveId: stickerConfig.driveId },
          update: {
            title: stickerConfig.title,
            sourceUrl: getDriveProxyUrl(stickerConfig.driveId),
            thumbnailUrl: getDriveProxyThumbnailUrl(stickerConfig.driveId),
            tags: stickerConfig.tags || [],
            caption: stickerConfig.caption || `${stickerConfig.title} - Share to spread media literacy!`,
          },
          create: {
            title: stickerConfig.title,
            filename,
            driveId: stickerConfig.driveId,
            sourceUrl: getDriveProxyUrl(stickerConfig.driveId),
            thumbnailUrl: getDriveProxyThumbnailUrl(stickerConfig.driveId),
            collectionId: collection.id,
            tags: stickerConfig.tags || [],
            caption: stickerConfig.caption || `${stickerConfig.title} - Share to spread media literacy!`,
          },
        })
        console.log(`    ✓ ${stickerConfig.title}`)
        totalImported++
      } catch (error) {
        console.error(`    ✗ Failed to import ${stickerConfig.title}:`, error)
      }
    }
  }

  console.log(`\n✅ Import complete! ${totalImported} stickers imported.`)
}

// Run the import
importStickers()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
