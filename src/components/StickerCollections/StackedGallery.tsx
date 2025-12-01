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

interface StackedGalleryProps {
  stickers: GallerySticker[]
  collections?: CollectionInfo[]
  onView?: (id: string) => void
  onDownload?: (id: string) => void
  onCollectionClick?: (collectionId: string) => void
  maxVisible?: number
  className?: string
}

export function StackedGallery({
  stickers,
  collections = [],
  onView,
  onDownload,
  onCollectionClick,
  maxVisible = 7,
  className,
}: StackedGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSticker, setSelectedSticker] = useState<GallerySticker | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  // Get visible stickers for the fan
  const visibleStickers = useMemo(() => {
    return stickers.slice(0, maxVisible)
  }, [stickers, maxVisible])

  // Get the top (front) sticker
  const topSticker = visibleStickers[0]

  const handleView = useCallback(
    async (sticker?: GallerySticker) => {
      const stickerToView = sticker || topSticker
      if (!stickerToView) return

      setSelectedSticker(stickerToView)
      setModalOpen(true)

      // Track view
      if (onView) {
        onView(stickerToView.id)
      } else {
        try {
          await fetch('/api/stickers/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: stickerToView.id }),
          })
        } catch (error) {
          console.error('Failed to track view:', error)
        }
      }
    },
    [onView, topSticker]
  )

  const handleDownload = useCallback(
    async (sticker?: GallerySticker) => {
      const stickerToDownload = sticker || topSticker
      if (!stickerToDownload) return

      // Track download
      if (onDownload) {
        onDownload(stickerToDownload.id)
      } else {
        try {
          await fetch('/api/stickers/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: stickerToDownload.id }),
          })
        } catch (error) {
          console.error('Failed to track download:', error)
        }
      }

      // Trigger download
      const link = document.createElement('a')
      link.href = stickerToDownload.imageUrl
      link.download = `${stickerToDownload.title.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [onDownload, topSticker]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleView()
      }
    },
    [handleView]
  )

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id))
  }

  if (stickers.length === 0) {
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
      {/* Fanned Card Stack */}
      <div className="flex flex-col items-center">
        {/* Card Stack Container */}
        <div
          className="relative w-full max-w-[500px] h-[320px] sm:h-[380px] md:h-[420px] mx-auto mb-8"
          style={{ perspective: '1200px' }}
        >
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {visibleStickers.map((sticker, index) => {
              const totalCards = visibleStickers.length
              const isHovered = hoveredIndex === index
              const hasError = imageErrors.has(sticker.id)

              // Fan layout: cards spread from left to right with rotation
              // Center card (index 0) is at the front, others fan out behind
              const centerIndex = 0
              const offset = index - centerIndex

              // Calculate rotation and position for fan effect
              // Cards on the left rotate counter-clockwise, cards on the right rotate clockwise
              const baseRotation = offset * 8 // degrees per card
              const xOffset = offset * 35 // horizontal spread
              const yOffset = Math.abs(offset) * 5 // slight vertical offset for depth
              const zOffset = -index * 2 // z-depth (cards behind are further back)

              return (
                <motion.div
                  key={sticker.id}
                  initial={{ opacity: 0, scale: 0.8, rotateZ: baseRotation }}
                  animate={{
                    opacity: 1,
                    scale: isHovered ? 1.05 : 1,
                    rotateZ: isHovered ? baseRotation * 0.5 : baseRotation,
                    x: xOffset,
                    y: yOffset + (isHovered ? -15 : 0),
                    z: zOffset + (isHovered ? 30 : 0),
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                  }}
                  className={cn(
                    'absolute w-[180px] h-[240px] sm:w-[200px] sm:h-[280px] md:w-[220px] md:h-[300px]',
                    'rounded-2xl overflow-hidden bg-white dark:bg-slate-800 cursor-pointer',
                    'border border-slate-200 dark:border-slate-700',
                    'shadow-xl',
                    isHovered && 'shadow-2xl shadow-slate-400/30 dark:shadow-black/50'
                  )}
                  style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'center bottom',
                    zIndex: totalCards - index,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => handleView(sticker)}
                  onKeyDown={handleKeyDown}
                  tabIndex={index === 0 ? 0 : -1}
                  role="button"
                  aria-label={`View ${sticker.title} sticker`}
                >
                  {/* Card content */}
                  <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 sm:p-6">
                    {hasError ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Sparkles className="w-8 h-8" />
                        <span className="text-xs">Image unavailable</span>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={sticker.imageUrl}
                        alt={sticker.title}
                        className="max-w-full max-h-full object-contain drop-shadow-lg"
                        loading={index < 3 ? 'eager' : 'lazy'}
                        onError={() => handleImageError(sticker.id)}
                      />
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* CTA Buttons - Below the card stack */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => handleView()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl"
            aria-label="View sticker"
          >
            <Eye size={18} />
            <span>View</span>
          </button>
          <button
            onClick={() => handleDownload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl"
            aria-label="Download sticker"
          >
            <Download size={18} />
            <span>Download</span>
          </button>
        </div>

        {/* Collections List */}
        {collections.length > 0 && (
          <div className="w-full max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">
              Browse by Collection
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => onCollectionClick?.(collection.id)}
                  className="group flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-pink-400 dark:hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/10 transition-all"
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors text-center line-clamp-2">
                    {collection.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {collection.count} stickers
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
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
