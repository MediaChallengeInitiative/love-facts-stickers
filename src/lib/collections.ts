import { unstable_cache } from 'next/cache'
import prisma from '@/lib/db'
import { COLLECTIONS_TAG, STICKERS_TAG } from '@/lib/revalidate'

/**
 * Server-side data loaders for the dynamic category pages.
 *
 * Wrapped in `unstable_cache` and tagged so a Drive sync can invalidate them
 * via `revalidateTag(COLLECTIONS_TAG | STICKERS_TAG)` — see lib/revalidate.ts.
 */

export interface CollectionStickerRow {
  id: string
  title: string
  thumbnailUrl: string
  sourceUrl: string
  caption: string | null
  tags: string[]
  collectionId: string
  isHero: boolean
  heroRank: number | null
  shareCount: number
  viewCount: number
  usefulCount: number
}

export interface CollectionWithStickers {
  id: string
  name: string
  slug: string
  description: string | null
  coverImage: string | null
  stickers: CollectionStickerRow[]
}

/** Load a single collection (by slug) plus all of its stickers. */
export const getCollectionBySlug = unstable_cache(
  async (slug: string): Promise<CollectionWithStickers | null> => {
    const collection = await prisma.collection.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        coverImage: true,
        stickers: {
          orderBy: [{ isHero: 'desc' }, { heroRank: 'asc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            sourceUrl: true,
            caption: true,
            tags: true,
            collectionId: true,
            isHero: true,
            heroRank: true,
            shareCount: true,
            viewCount: true,
            usefulCount: true,
          },
        },
      },
    })
    return collection
  },
  ['collection-by-slug'],
  { tags: [COLLECTIONS_TAG, STICKERS_TAG], revalidate: 300 }
)

/** All collection slugs that currently have at least one sticker (for SSG). */
export const getNonEmptyCollectionSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const collections = await prisma.collection.findMany({
      where: { stickers: { some: {} } },
      select: { slug: true },
    })
    return collections.map((c) => c.slug)
  },
  ['non-empty-collection-slugs'],
  { tags: [COLLECTIONS_TAG, STICKERS_TAG], revalidate: 300 }
)
