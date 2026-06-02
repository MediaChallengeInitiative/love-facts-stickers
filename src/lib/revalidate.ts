import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Cache tags used across the app so a single sync can invalidate every
 * server-rendered surface that reads collections / stickers.
 *
 * - Data loaders (see lib/collections.ts) wrap their Prisma reads in
 *   `unstable_cache` tagged with these values.
 * - Sync entry points (webhook, /api/sync/*, cron) call
 *   `revalidateStickerPages()` after they mutate the database.
 */
export const COLLECTIONS_TAG = 'collections'
export const STICKERS_TAG = 'stickers'

/**
 * Invalidate every page/route that depends on sticker or collection data so
 * the site reflects Drive additions/deletions without a redeploy.
 *
 * Safe to call from any Route Handler. Errors are swallowed (revalidation is
 * best-effort and must never break a sync response). Pass the affected
 * collection slugs to also bust their specific dynamic pages.
 */
export function revalidateStickerPages(affectedSlugs: string[] = []) {
  try {
    revalidateTag(COLLECTIONS_TAG)
    revalidateTag(STICKERS_TAG)
    // Home page (collections grid + all-stickers gallery)
    revalidatePath('/')
    // Every dynamic category page (route-level)
    revalidatePath('/collection/[slug]', 'page')
    // Every individual sticker detail page, so a deleted sticker's page 404s
    // and an edited sticker's metadata refreshes without waiting for ISR.
    revalidatePath('/sticker/[id]', 'page')
    // And each specific category page we touched
    for (const slug of affectedSlugs) {
      if (slug) revalidatePath(`/collection/${slug}`)
    }
  } catch (error) {
    console.error('[revalidate] Failed to revalidate sticker pages:', error)
  }
}
