import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCollectionBySlug, getNonEmptyCollectionSlugs } from '@/lib/collections'
import { CollectionDetailClient } from './CollectionDetailClient'

/**
 * Dynamic category page — /collection/[slug].
 *
 * Server Component on purpose: it reads through `getCollectionBySlug`, whose
 * Prisma query is wrapped in `unstable_cache` and tagged with
 * COLLECTIONS_TAG / STICKERS_TAG. A Drive sync (webhook / cron / auto) calls
 * `revalidateStickerPages()` → `revalidateTag(...)`, so adds & deletions show
 * here within one sync cycle without a redeploy. Do NOT switch this to a raw
 * client fetch — that would bypass the tagged cache and break auto-update.
 */

// Re-render at most every 5 min even without an explicit tag bust (safety net).
export const revalidate = 300

// Pre-render every non-empty category at build time; new categories are
// rendered on-demand and then cached (default `dynamicParams: true`).
export async function generateStaticParams() {
  const slugs = await getNonEmptyCollectionSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug)

  if (!collection) {
    return { title: 'Collection not found' }
  }

  const count = collection.stickers.length
  const description =
    collection.description ||
    `Browse ${count} free ${collection.name} media literacy sticker${count === 1 ? '' : 's'} from Love Facts. Save and share on WhatsApp, Telegram, and more — no signup.`
  const ogImage = collection.coverImage || collection.stickers[0]?.thumbnailUrl

  return {
    title: collection.name,
    description,
    alternates: { canonical: `/collection/${collection.slug}` },
    openGraph: {
      title: `${collection.name} — Love Facts`,
      description,
      url: `/collection/${collection.slug}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${collection.name} — Love Facts`,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function CollectionPage({
  params,
}: {
  params: { slug: string }
}) {
  const collection = await getCollectionBySlug(params.slug)

  // Unknown slug, or a category that lost all its stickers to a Drive deletion.
  if (!collection || collection.stickers.length === 0) {
    notFound()
  }

  return <CollectionDetailClient collection={collection} />
}
