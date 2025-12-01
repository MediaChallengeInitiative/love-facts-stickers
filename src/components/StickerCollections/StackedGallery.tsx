'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Eye, Download, Sparkles } from 'lucide-react'
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

interface CollectionCardStackProps {
  collection: CollectionInfo
  stickers: GallerySticker[]
  onView: (sticker: GallerySticker) => void
  onDownload: (sticker: GallerySticker) => void
  onCollectionClick?: (collectionId: string) => void
  imageErrors: Set<string>
  onImageError: (id: string) => void
}

function CollectionCardStack({
  collection,
  stickers,
  onView,
  onDownload,
  onCollectionClick,
  imageErrors,
  onImageError,
}: CollectionCardStackProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxVisible = 5
  const visibleStickers = stickers.slice(0, maxVisible)
  const topSticker = visibleStickers[0]

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (topSticker) onView(topSticker)
    }
  }

  if (visibleStickers.length === 0) {
    return (
      <div className="flex flex-col items-center p-3 sm:p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        {/* Collection Name - Top */}
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1 text-center line-clamp-1 px-2">
          {collection.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {collection.count} stickers
        </p>

        {/* CTA Buttons - Below text */}
        <div className="flex items-center justify-center gap-2 mb-4 relative z-10">
          <span className="text-xs text-slate-400 px-3 py-1.5">No stickers yet</span>
        </div>

        {/* Empty State - Bottom */}
        <div className="relative w-full h-[140px] xs:h-[160px] sm:h-[180px] flex items-center justify-center">
          <div className="w-[100px] h-[130px] xs:w-[110px] xs:h-[140px] sm:w-[120px] sm:h-[150px] rounded-xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-shadow">
      {/* Collection Name - Top */}
      <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1 text-center line-clamp-1 px-2">
        {collection.name}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
        {collection.count} stickers
      </p>

      {/* CTA Buttons - Below text, above cards */}
      <div className="flex items-center justify-center gap-2 mb-3 relative z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (topSticker) onView(topSticker)
          }}
          className="flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          aria-label={`View ${collection.name} sticker`}
        >
          <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>View</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (topSticker) onDownload(topSticker)
          }}
          className="flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 text-[10px] sm:text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          aria-label={`Download ${collection.name} sticker`}
        >
          <Download size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>Download</span>
        </button>
      </div>

      {/* Fanned Card Stack - Bottom */}
      <div
        className="relative w-full h-[140px] xs:h-[160px] sm:h-[180px]"
        style={{ perspective: '800px' }}
      >
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {visibleStickers.map((sticker, index) => {
            const totalCards = visibleStickers.length
            const isHovered = hoveredIndex === index
            const hasError = imageErrors.has(sticker.id)

            // Fan layout with rotation from bottom center - smaller values for mobile
            const baseRotation = index * 5
            const xOffset = index * 15
            const yOffset = Math.abs(index) * 2
            const zOffset = -index * 2

            return (
              <motion.div
                key={sticker.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: isHovered ? 1.05 : 1,
                  rotateZ: isHovered ? baseRotation * 0.5 : baseRotation,
                  x: xOffset,
                  y: yOffset + (isHovered ? -8 : 0),
                  z: zOffset + (isHovered ? 15 : 0),
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
                className={cn(
                  'absolute w-[100px] h-[130px] xs:w-[110px] xs:h-[140px] sm:w-[120px] sm:h-[150px]',
                  'rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-slate-800 cursor-pointer',
                  'border border-slate-200 dark:border-slate-700',
                  'shadow-md',
                  isHovered && 'shadow-lg shadow-slate-400/30 dark:shadow-black/50'
                )}
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center bottom',
                  zIndex: totalCards - index,
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onView(sticker)}
                onKeyDown={handleKeyDown}
                tabIndex={index === 0 ? 0 : -1}
                role="button"
                aria-label={`View ${sticker.title} sticker`}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-2 sm:p-3">
                  {hasError ? (
                    <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-[8px] sm:text-[10px]">Unavailable</span>
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={sticker.imageUrl}
                      alt={sticker.title}
                      className="max-w-full max-h-full object-contain drop-shadow-md"
                      loading={index < 2 ? 'eager' : 'lazy'}
                      onError={() => onImageError(sticker.id)}
                    />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Browse Collection Link - Very Bottom */}
      {onCollectionClick && (
        <button
          onClick={() => onCollectionClick(collection.id)}
          className="mt-3 text-xs text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 font-medium transition-colors relative z-10"
        >
          Browse all →
        </button>
      )}
    </div>
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
        <div className="w-24 h-24 mb-4 rounded-full bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No stickers found</h3>
        <p className="text-slate-500 dark:text-slate-400">Check back later for new stickers!</p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Collections Grid - Responsive for all devices */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {collections.map((collection) => (
          <CollectionCardStack
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
