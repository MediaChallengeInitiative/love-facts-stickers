import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      where: {
        // Only return collections that have stickers (from Google Drive sync)
        stickers: {
          some: {},
        },
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { stickers: true },
        },
        // Include first 3 stickers for preview gallery
        stickers: {
          take: 3,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
    })

    // Deduplicate collections by name - keep the one with most stickers
    const collectionsByName = new Map<string, typeof collections[0]>()
    for (const collection of collections) {
      const existing = collectionsByName.get(collection.name)
      if (!existing || (collection._count?.stickers || 0) > (existing._count?.stickers || 0)) {
        collectionsByName.set(collection.name, collection)
      }
    }
    const deduplicatedCollections = Array.from(collectionsByName.values())

    // Transform to include previewStickers field
    const collectionsWithPreviews = deduplicatedCollections.map((collection) => ({
      ...collection,
      previewStickers: collection.stickers,
      stickers: undefined, // Remove full stickers array
    }))

    return NextResponse.json(collectionsWithPreviews)
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}
