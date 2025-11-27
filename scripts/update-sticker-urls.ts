/**
 * Update Sticker URLs Script
 *
 * Updates all stickers with driveId to use the proxy URL format.
 * This ensures images are fetched through our proxy for reliable display.
 *
 * Usage:
 *   npx tsx scripts/update-sticker-urls.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateStickerUrls() {
  console.log('Updating sticker URLs to use proxy...\n')

  // Get all stickers with driveId
  const stickers = await prisma.sticker.findMany({
    where: {
      driveId: { not: null },
    },
  })

  console.log(`Found ${stickers.length} stickers with Google Drive IDs\n`)

  let updated = 0
  for (const sticker of stickers) {
    if (!sticker.driveId) continue

    const newSourceUrl = `/api/image/${sticker.driveId}`
    const newThumbnailUrl = `/api/image/${sticker.driveId}?size=400`

    // Only update if URLs are different
    if (sticker.sourceUrl !== newSourceUrl || sticker.thumbnailUrl !== newThumbnailUrl) {
      await prisma.sticker.update({
        where: { id: sticker.id },
        data: {
          sourceUrl: newSourceUrl,
          thumbnailUrl: newThumbnailUrl,
        },
      })
      console.log(`  ✓ Updated: ${sticker.title}`)
      updated++
    } else {
      console.log(`  - Skipped (already updated): ${sticker.title}`)
    }
  }

  console.log(`\n✅ Updated ${updated} sticker URLs`)
}

updateStickerUrls()
  .catch((e) => {
    console.error('Update failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
