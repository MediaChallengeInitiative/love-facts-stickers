import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // First, get all collections
    const collections = await prisma.collection.findMany({
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

    // Filter to only collections with stickers
    const collectionsWithStickers = collections.filter(c => (c._count?.stickers || 0) > 0)

    // Deduplicate collections by name - keep the one with most stickers
    const collectionsByName = new Map<string, typeof collections[0]>()
    for (const collection of collectionsWithStickers) {
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

    const response = NextResponse.json(collectionsWithPreviews)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('CDN-Cache-Control', 'no-store')
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store')
    return response
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections', details: String(error) },
      { status: 500 }
    )
  }
}
