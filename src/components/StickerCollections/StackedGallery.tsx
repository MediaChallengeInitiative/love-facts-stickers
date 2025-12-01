'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Eye, Download, Sparkles, ArrowRight } from 'lucide-react'
import { StickerModal } from './StickerModal'
import { cn } from '@/lib/utils'

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
  count: number
}

interface CollectionCardProps {
  collection: CollectionInfo
  stickers: GallerySticker[]
  onView: (sticker: GallerySticker) => void
  onDownload: (sticker: GallerySticker) => void
  onCollectionClick?: (collectionId: string) => void
  imageErrors: Set<string>
  onImageError: (id: string) => void
}

function CollectionCard({
  collection,
  stickers,
  onView,
  onDownload,
  onCollectionClick,
  imageErrors,
  onImageError,
}: CollectionCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const maxVisible = 4
  const visibleStickers = stickers.slice(0, maxVisible)
  const topSticker = visibleStickers[0]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (topSticker) onView(topSticker)
    }
  }

  return (
    <motion.div
      className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-pink-300 dark:hover:border-pink-600 transition-all duration-300"
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ boxShadow: isHovered ? '0 20px 40px -12px rgba(0,0,0,0.15)' : '0 4px 12px -2px rgba(0,0,0,0.08)' }}
    >
      {/* Card Image Area - Stacked cards effect */}
      <div
        className="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-100 via-slate-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-pink-950/20 overflow-hidden cursor-pointer"
        onClick={() => topSticker && onView(topSticker)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View ${collection.name} collection`}
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
                      "w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 rounded-xl bg-white dark:bg-slate-700 shadow-lg border border-slate-200/50 dark:border-slate-600/50 flex items-center justify-center p-2 overflow-hidden",
                      index === 0 && isHovered && "shadow-xl ring-2 ring-pink-400/30"
                    )}
                  >
                    {hasError ? (
                      <Sparkles className="w-6 h-6 text-slate-300 dark:text-slate-500" />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={sticker.imageUrl}
                        alt={sticker.title}
                        className="w-full h-full object-contain"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        onError={() => onImageError(sticker.id)}
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-xl bg-slate-200/50 dark:bg-slate-700/50 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
          </div>
        )}

        {/* Hover overlay with quick actions */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center pb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={false}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (topSticker) onView(topSticker)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-slate-800 text-xs font-medium hover:bg-white transition-colors shadow-lg"
            >
              <Eye size={14} />
              <span>View</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (topSticker) onDownload(topSticker)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 rounded-full text-white text-xs font-medium hover:bg-pink-600 transition-colors shadow-lg"
            >
              <Download size={14} />
              <span>Download</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Card Content */}
      <div className="p-3 sm:p-4">
        {/* Collection info */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
              {collection.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {collection.count} sticker{collection.count !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Action buttons - always visible on mobile */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => topSticker && onView(topSticker)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>
          <button
            onClick={() => topSticker && onDownload(topSticker)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-lg text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Download size={14} />
            <span>Get</span>
          </button>
        </div>

        {/* Browse all link */}
        {onCollectionClick && (
          <button
            onClick={() => onCollectionClick(collection.id)}
            className="w-full mt-2 flex items-center justify-center gap-1 py-1.5 text-xs text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium transition-colors group/link"
          >
            <span>Browse all</span>
            <ArrowRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

interface StackedGalleryProps {
  stickers: GallerySticker[]
  collections?: CollectionInfo[]
  onView?: (id: string) => void
  onDownload?: (id: string) => void
  onCollectionClick?: (collectionId: string) => void
  className?: string
}

export function StackedGallery({
  stickers,
  collections = [],
  onView,
  onDownload,
  onCollectionClick,
  className,
}: StackedGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSticker, setSelectedSticker] = useState<GallerySticker | null>(null)
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

  const handleView = useCallback(
    async (sticker: GallerySticker) => {
      setSelectedSticker(sticker)
      setModalOpen(true)

      if (onView) {
        onView(sticker.id)
      } else {
        try {
          await fetch('/api/stickers/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: sticker.id }),
          })
        } catch (error) {
          console.error('Failed to track view:', error)
        }
      }
    },
    [onView]
  )

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

      const link = document.createElement('a')
      link.href = sticker.imageUrl
      link.download = `${sticker.title.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [onDownload]
  )

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id))
  }

  if (stickers.length === 0 && collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-pink-400 dark:text-pink-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No stickers found</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Check back later for new stickers!</p>
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
            onView={handleView}
            onDownload={handleDownload}
            onCollectionClick={onCollectionClick}
            imageErrors={imageErrors}
            onImageError={handleImageError}
          />
        ))}
      </div>

      {/* Preview Modal */}
      <StickerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        sticker={selectedSticker ? { ...selectedSticker, imageUrl: selectedSticker.imageUrl } : null}
        onDownload={onDownload}
      />
    </div>
  )
}

export default StackedGallery
