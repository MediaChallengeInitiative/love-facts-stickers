'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, MessageCircle, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { StickerGrid } from '@/components/stickers/StickerGrid'
import { DensityToggle } from '@/components/stickers/DensityToggle'
import type { StickerCardDensity } from '@/components/stickers/StickerCard'
import { StickerPreviewModal } from '@/components/modals/StickerPreviewModal'
import { ShareSheet } from '@/components/share/ShareSheet'
import type { Sticker } from '@/lib/types'
import type { CollectionWithStickers, CollectionStickerRow } from '@/lib/collections'
import { downloadSticker } from '@/lib/download'
import { getStickerShareUrl } from '@/lib/urls'

/**
 * Client surface for a single category page. Reuses the same StickerGrid /
 * preview / share / download primitives as the home page so behaviour stays
 * identical site-wide. Data arrives from the Server Component (tagged cache),
 * so this component never fetches — it just presents and handles interaction.
 */

// Map the lean cached row shape into the full Sticker shape StickerGrid wants.
function toSticker(row: CollectionStickerRow, collectionName: string, collectionSlug: string): Sticker {
  return {
    id: row.id,
    title: row.title,
    thumbnailUrl: row.thumbnailUrl,
    sourceUrl: row.sourceUrl,
    caption: row.caption,
    tags: row.tags,
    collectionId: row.collectionId,
    collection: { id: row.collectionId, name: collectionName, slug: collectionSlug },
    isHero: row.isHero,
    heroRank: row.heroRank,
    shareCount: row.shareCount,
    viewCount: row.viewCount,
    usefulCount: row.usefulCount,
  }
}

export function CollectionDetailClient({ collection }: { collection: CollectionWithStickers }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [density, setDensity] = useState<StickerCardDensity>('default')
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [shareSubject, setShareSubject] = useState<Sticker | null>(null)

  const stickers = useMemo(
    () => collection.stickers.map((row) => toSticker(row, collection.name, collection.slug)),
    [collection]
  )

  const filteredStickers = useMemo(() => {
    if (!searchQuery) return stickers
    const q = searchQuery.toLowerCase()
    return stickers.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.tags && s.tags.some((tag) => tag.toLowerCase().includes(q)))
    )
  }, [stickers, searchQuery])

  const handleStickerClick = useCallback((sticker: Sticker) => {
    setSelectedSticker(sticker)
    setShowPreviewModal(true)
  }, [])

  // One-tap save → toast with a WhatsApp "Send" shortcut (mirrors home page).
  const handleStickerDownload = useCallback(
    async (sticker: Sticker, type: 'single' | 'collection' = 'single') => {
      await downloadSticker(sticker, { downloadType: type })

      const shareUrl = getStickerShareUrl(sticker.id)
      const text = sticker.caption || `Check out: ${sticker.title} — from Love Facts`
      const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`

      toast.custom(
        (t) => (
          <div
            className={`max-w-sm w-full bg-white dark:bg-lovefacts-teal shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-lovefacts-turquoise/30 ${
              t.visible ? 'animate-enter' : 'animate-leave'
            }`}
          >
            <div className="flex-1 p-4 flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-lovefacts-teal dark:text-white">Saved</p>
                <p className="text-xs text-lovefacts-teal/60 dark:text-lovefacts-turquoise/70 truncate">
                  {sticker.title}
                </p>
              </div>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => toast.dismiss(t.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-lovefacts-green text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-lovefacts-green-dark transition-colors"
              >
                <MessageCircle size={14} />
                Send
              </a>
            </div>
          </div>
        ),
        { duration: 4500 }
      )
    },
    []
  )

  const handleStickerShare = useCallback((sticker: Sticker) => {
    setShareSubject(sticker)
  }, [])

  return (
    <div className="min-h-[100svh]">
      {/* Header / hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-lovefacts-turquoise/5 to-lovefacts-coral/5 dark:from-lovefacts-teal-dark dark:via-lovefacts-teal dark:to-lovefacts-teal-dark border-b border-lovefacts-turquoise/15 dark:border-lovefacts-turquoise/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 xs:pt-8 xs:pb-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center gap-1.5 text-xs xs:text-sm text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60">
              <li>
                <Link href="/" className="hover:text-lovefacts-coral transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/#collections" className="hover:text-lovefacts-coral transition-colors">
                  Collections
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-lovefacts-teal dark:text-white font-medium truncate max-w-[12rem]">
                {collection.name}
              </li>
            </ol>
          </nav>

          {/* Back link */}
          <Link
            href="/#collections"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-lovefacts-coral hover:text-lovefacts-coral-dark dark:hover:text-lovefacts-coral-light transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lovefacts-coral rounded-md"
          >
            <ArrowLeft size={16} />
            Back to collections
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start gap-3 xs:gap-4"
          >
            <div className="shrink-0 mt-1 inline-flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 rounded-2xl bg-lovefacts-coral/10 dark:bg-lovefacts-coral/20 text-lovefacts-coral">
              <FolderOpen size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-lovefacts-teal dark:text-white leading-tight">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="mt-1.5 text-sm xs:text-base text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 max-w-2xl">
                  {collection.description}
                </p>
              )}
              <p className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 text-xs font-medium text-lovefacts-teal dark:text-lovefacts-turquoise-light">
                {stickers.length} sticker{stickers.length === 1 ? '' : 's'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Controls + grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xs:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 xs:mb-8">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-lovefacts-teal/40 dark:text-lovefacts-turquoise/40 pointer-events-none"
            />
            <input
              type="search"
              inputMode="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${collection.name}…`}
              aria-label={`Search stickers in ${collection.name}`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-lovefacts-teal border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 text-sm text-lovefacts-teal dark:text-white placeholder:text-lovefacts-teal/40 dark:placeholder:text-lovefacts-turquoise/40 focus:outline-none focus:ring-2 focus:ring-lovefacts-coral/50 focus:border-lovefacts-coral/50 transition-all"
            />
          </div>
          <div className="hidden md:flex items-center justify-end shrink-0">
            <DensityToggle value={density} onChange={setDensity} />
          </div>
        </div>

        {filteredStickers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 flex items-center justify-center">
              <Search className="w-9 h-9 text-lovefacts-turquoise/50" />
            </div>
            <h3 className="text-lg font-semibold text-lovefacts-teal dark:text-white mb-2">No matches</h3>
            <p className="text-sm text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60 mb-4">
              Nothing in this collection matches “{searchQuery}”.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-lovefacts-coral text-white text-sm font-semibold hover:bg-lovefacts-coral-dark transition-colors"
            >
              Clear search
            </button>
          </div>
        ) : (
          <StickerGrid
            stickers={filteredStickers}
            onStickerClick={handleStickerClick}
            onStickerDownload={(s) => handleStickerDownload(s, 'single')}
            onStickerShare={handleStickerShare}
            density={density}
          />
        )}
      </section>

      <StickerPreviewModal
        sticker={selectedSticker}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onDownload={(sticker, type) => handleStickerDownload(sticker, type)}
      />

      <ShareSheet
        open={!!shareSubject}
        onClose={() => setShareSubject(null)}
        subject={
          shareSubject
            ? {
                id: shareSubject.id,
                title: shareSubject.title,
                url: getStickerShareUrl(shareSubject.id),
                caption: shareSubject.caption,
                imageUrl: shareSubject.sourceUrl,
              }
            : { id: '', title: '', url: '' }
        }
      />
    </div>
  )
}
