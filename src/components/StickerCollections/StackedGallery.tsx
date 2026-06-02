'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Sparkles, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_AUTO_RETRIES = 3
const RETRY_DELAY = 2000

export interface GallerySticker {
  id: string
  title: string
  imageUrl: string
  collectionId?: string
  collectionName?: string
}

export interface CollectionInfo {
  id: string
  name: string
  slug: string
  count: number
}

interface CollectionCardProps {
  collection: CollectionInfo
  stickers: GallerySticker[]
  onDownload: (sticker: GallerySticker) => void
  imageErrors: Set<string>
  onImageError: (id: string) => void
}

function CollectionCard({
  collection,
  stickers,
  onDownload,
  imageErrors,
  onImageError,
}: CollectionCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const retryCounts = useRef<Map<string, number>>(new Map())
  const imgRefs = useRef<Map<string, HTMLImageElement>>(new Map())
  const maxVisible = 4
  const visibleStickers = stickers.slice(0, maxVisible)
  const topSticker = visibleStickers[0]
  const href = `/collection/${collection.slug}`

  const handleImageError = useCallback((stickerId: string, imageUrl: string) => {
    const currentRetries = retryCounts.current.get(stickerId) || 0
    if (currentRetries < MAX_AUTO_RETRIES) {
      retryCounts.current.set(stickerId, currentRetries + 1)
      setTimeout(() => {
        const img = imgRefs.current.get(stickerId)
        if (img) {
          const separator = imageUrl.includes('?') ? '&' : '?'
          img.src = `${imageUrl}${separator}_t=${Date.now()}`
        }
      }, RETRY_DELAY * (currentRetries + 1))
    } else {
      onImageError(stickerId)
    }
  }, [onImageError])

  return (
    <motion.div
      className="group relative bg-white dark:bg-lovefacts-teal rounded-2xl border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 overflow-hidden hover:border-lovefacts-coral/50 dark:hover:border-lovefacts-coral/50 transition-all duration-300"
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ boxShadow: isHovered ? '0 20px 40px -12px rgba(0,0,0,0.15)' : '0 4px 12px -2px rgba(0,0,0,0.08)' }}
    >
      {/* Card Image Area - Stacked cards effect. The whole area is a real link
          to the category page so it opens in a new tab / is keyboard-navigable. */}
      <Link
        href={href}
        aria-label={`Browse all ${collection.count} stickers in ${collection.name}`}
        className="relative block w-full aspect-[4/3] bg-gradient-to-br from-white via-lovefacts-turquoise/5 to-lovefacts-coral/5 dark:from-lovefacts-teal-dark dark:via-lovefacts-teal dark:to-lovefacts-coral/10 overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lovefacts-coral"
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Stacked cards */}
        {visibleStickers.length > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {visibleStickers.map((sticker, index) => {
              const hasError = imageErrors.has(sticker.id)
              const rotation = (index - 1) * 6
              const offsetX = (index - 1) * 8
              const offsetY = index * 2
              const scale = 1 - index * 0.05

              return (
                <motion.div
                  key={sticker.id}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: isHovered && index === 0 ? 1.05 : scale,
                    rotate: isHovered && index === 0 ? 0 : rotation,
                    x: offsetX,
                    y: offsetY,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{ zIndex: visibleStickers.length - index }}
                >
                  <div
                    className={cn(
                      "w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 rounded-xl bg-white dark:bg-lovefacts-teal-light shadow-lg border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 flex items-center justify-center p-2 overflow-hidden",
                      index === 0 && isHovered && "shadow-xl ring-2 ring-lovefacts-coral/30"
                    )}
                  >
                    {hasError ? (
                      <Sparkles className="w-6 h-6 text-lovefacts-turquoise/30 dark:text-lovefacts-turquoise/50" />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        ref={(el) => { if (el) imgRefs.current.set(sticker.id, el) }}
                        src={sticker.imageUrl}
                        alt={sticker.title}
                        className="w-full h-full object-contain"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        onError={() => handleImageError(sticker.id, sticker.imageUrl)}
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-xl bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-lovefacts-turquoise/40 dark:text-lovefacts-turquoise/60" />
            </div>
          </div>
        )}

        {/* Hover overlay — non-interactive "open" hint (the whole area is a link) */}
        <div className="absolute inset-0 bg-gradient-to-t from-lovefacts-teal/80 via-lovefacts-teal/20 to-transparent flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 motion-reduce:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-lovefacts-teal shadow-lg">
            Browse all
            <ArrowRight size={14} />
          </span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-3 sm:p-4">
        {/* Collection info — links to the category page */}
        <Link href={href} className="block group/title focus-visible:outline-none">
          <h3 className="text-sm sm:text-base font-semibold text-lovefacts-teal dark:text-white truncate group-hover/title:text-lovefacts-coral transition-colors">
            {collection.name}
          </h3>
          <p className="text-xs text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60 mb-2.5">
            {collection.count} sticker{collection.count !== 1 ? 's' : ''}
          </p>
        </Link>

        {/* Actions — primary "Browse all" navigates; Save grabs the featured sticker */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href={href}
            className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[40px] py-2 px-3 bg-gradient-to-r from-lovefacts-coral to-lovefacts-coral-dark hover:from-lovefacts-coral-dark hover:to-lovefacts-coral rounded-lg text-white text-xs font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lovefacts-coral focus-visible:ring-offset-2 dark:focus-visible:ring-offset-lovefacts-teal"
            aria-label={`Browse all ${collection.count} stickers in ${collection.name}`}
          >
            Browse all
            <ArrowRight size={15} />
          </Link>
          <button
            onClick={() => topSticker && onDownload(topSticker)}
            disabled={!topSticker}
            className="shrink-0 inline-flex items-center justify-center w-10 min-h-[40px] py-2 bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 hover:bg-lovefacts-turquoise/20 dark:hover:bg-lovefacts-turquoise/30 rounded-lg text-lovefacts-teal dark:text-lovefacts-turquoise-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={`Save a sticker from ${collection.name}`}
            title="Quick save"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

interface StackedGalleryProps {
  stickers: GallerySticker[]
  collections?: CollectionInfo[]
  onDownload?: (id: string) => void
  className?: string
}

export function StackedGallery({
  stickers,
  collections = [],
  onDownload,
  className,
}: StackedGalleryProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  // Group stickers by collection
  const stickersByCollection = useMemo(() => {
    const grouped = new Map<string, GallerySticker[]>()

    stickers.forEach((sticker) => {
      const collectionId = sticker.collectionId || 'uncategorized'
      if (!grouped.has(collectionId)) {
        grouped.set(collectionId, [])
      }
      grouped.get(collectionId)!.push(sticker)
    })

    return grouped
  }, [stickers])

  const handleDownload = useCallback(
    async (sticker: GallerySticker) => {
      if (onDownload) {
        onDownload(sticker.id)
      } else {
        try {
          await fetch('/api/stickers/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: sticker.id }),
          })
        } catch (error) {
          console.error('Failed to track download:', error)
        }
      }

      try {
        const imageRes = await fetch(sticker.imageUrl)
        const blob = await imageRes.blob()
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = `${sticker.title.replace(/\s+/g, '-').toLowerCase()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      } catch {
        window.open(sticker.imageUrl, '_blank')
      }
    },
    [onDownload]
  )

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id))
  }

  if (stickers.length === 0 && collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-lovefacts-turquoise/20 to-lovefacts-coral/20 dark:from-lovefacts-turquoise/30 dark:to-lovefacts-coral/30 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-lovefacts-turquoise dark:text-lovefacts-turquoise" />
        </div>
        <h3 className="text-lg font-semibold text-lovefacts-teal dark:text-white mb-2">No stickers found</h3>
        <p className="text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60 text-sm">Check back later for new stickers!</p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Collections Grid - Fully responsive */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            stickers={stickersByCollection.get(collection.id) || []}
            onDownload={handleDownload}
            imageErrors={imageErrors}
            onImageError={handleImageError}
          />
        ))}
      </div>
    </div>
  )
}

export default StackedGallery
