'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Download, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { StickerModal } from './StickerModal'
import { cn } from '@/lib/utils'

export interface GallerySticker {
  id: string
  title: string
  imageUrl: string
  collectionId?: string
  collectionName?: string
}

interface StackedGalleryProps {
  stickers: GallerySticker[]
  onView?: (id: string) => void
  onDownload?: (id: string) => void
  maxVisible?: number
  className?: string
}

export function StackedGallery({
  stickers,
  onView,
  onDownload,
  maxVisible = 5,
  className,
}: StackedGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSticker, setSelectedSticker] = useState<GallerySticker | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  // Get visible stickers based on active index
  const visibleStickers = useMemo(() => {
    if (stickers.length === 0) return []
    const visible: Array<{ sticker: GallerySticker; originalIndex: number }> = []
    for (let i = 0; i < Math.min(maxVisible, stickers.length); i++) {
      const index = (activeIndex + i) % stickers.length
      visible.push({ sticker: stickers[index], originalIndex: index })
    }
    return visible
  }, [stickers, activeIndex, maxVisible])

  const handleView = useCallback(
    async (sticker: GallerySticker) => {
      setSelectedSticker(sticker)
      setModalOpen(true)

      // Track view
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
    async (sticker: GallerySticker, e?: React.MouseEvent) => {
      e?.stopPropagation()

      // Track download
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

      // Trigger download
      const link = document.createElement('a')
      link.href = sticker.imageUrl
      link.download = `${sticker.title.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    [onDownload]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, sticker: GallerySticker) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleView(sticker)
      }
    },
    [handleView]
  )

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + stickers.length) % stickers.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % stickers.length)
  }

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
      {/* Desktop 3D Stacked View */}
      <div className="hidden md:block">
        <div
          className="relative mx-auto flex items-center justify-center"
          style={{
            perspective: '1000px',
            perspectiveOrigin: 'center center',
            height: '480px',
          }}
        >
          {/* Navigation buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-0 z-30 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all text-slate-700 dark:text-slate-200 hover:scale-110"
            aria-label="Previous sticker"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="relative w-[280px] h-[380px]">
            <AnimatePresence mode="popLayout">
              {visibleStickers.map(({ sticker }, stackIndex) => {
                const isHovered = hoveredIndex === stackIndex
                const isFocused = focusedIndex === stackIndex
                const isActive = isHovered || isFocused
                const hasError = imageErrors.has(sticker.id)

                // Calculate 3D transforms for stacking effect
                const zOffset = -stackIndex * 30
                const yOffset = stackIndex * 8
                const rotation = stackIndex * 2
                const scale = 1 - stackIndex * 0.05

                return (
                  <motion.div
                    key={sticker.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1 - stackIndex * 0.15,
                      scale: isActive && stackIndex === 0 ? 1.05 : scale,
                      rotateY: rotation,
                      z: isActive && stackIndex === 0 ? 60 : zOffset,
                      y: yOffset,
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 25,
                    }}
                    className={cn(
                      'absolute inset-0 w-[280px] h-[380px] rounded-2xl overflow-hidden bg-white dark:bg-slate-800 cursor-pointer',
                      'border border-slate-200 dark:border-slate-700',
                      isActive && stackIndex === 0 && 'shadow-2xl shadow-pink-500/20',
                      !isActive && 'shadow-xl'
                    )}
                    style={{
                      transformStyle: 'preserve-3d',
                      zIndex: maxVisible - stackIndex,
                    }}
                    onMouseEnter={() => setHoveredIndex(stackIndex)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onFocus={() => setFocusedIndex(stackIndex)}
                    onBlur={() => setFocusedIndex(null)}
                    onClick={() => stackIndex === 0 && handleView(sticker)}
                    onKeyDown={(e) => stackIndex === 0 && handleKeyDown(e, sticker)}
                    tabIndex={stackIndex === 0 ? 0 : -1}
                    role="button"
                    aria-label={`View ${sticker.title} sticker`}
                  >
                    {/* Collection tag */}
                    {sticker.collectionName && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-[10px] font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                          {sticker.collectionName}
                        </span>
                      </div>
                    )}

                    {/* Image container */}
                    <div className="relative h-[260px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
                      {/* Decorative pattern */}
                      <div className="absolute inset-0 opacity-30 dark:opacity-20">
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                            backgroundSize: '16px 16px',
                          }}
                        />
                      </div>

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
                          className={cn(
                            'relative max-w-full max-h-full object-contain transition-transform duration-300',
                            isActive && stackIndex === 0 && 'scale-110'
                          )}
                          loading={stackIndex === 0 ? 'eager' : 'lazy'}
                          onError={() => handleImageError(sticker.id)}
                        />
                      )}
                    </div>

                    {/* Card footer */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 mb-3">
                        {sticker.title}
                      </h3>

                      {/* CTA Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleView(sticker)
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          aria-label={`View ${sticker.title} sticker`}
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={(e) => handleDownload(sticker, e)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-lg text-white text-xs font-medium transition-colors"
                          aria-label={`Download ${sticker.title} sticker`}
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-0 z-30 p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all text-slate-700 dark:text-slate-200 hover:scale-110"
            aria-label="Next sticker"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Stack indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {stickers.slice(0, Math.min(10, stickers.length)).map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                activeIndex === index
                  ? 'bg-pink-500 w-6'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
              )}
              aria-label={`Go to sticker ${index + 1}`}
            />
          ))}
          {stickers.length > 10 && (
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
              +{stickers.length - 10} more
            </span>
          )}
        </div>
      </div>

      {/* Mobile Single Card View with Swipe */}
      <div className="md:hidden">
        <div className="relative px-4">
          <AnimatePresence mode="wait">
            {stickers[activeIndex] && (
              <motion.div
                key={stickers[activeIndex].id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-[320px] mx-auto"
              >
                <div
                  className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700"
                  onClick={() => handleView(stickers[activeIndex])}
                  onKeyDown={(e) => handleKeyDown(e, stickers[activeIndex])}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${stickers[activeIndex].title} sticker`}
                >
                  {/* Collection tag */}
                  {stickers[activeIndex].collectionName && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center px-2.5 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-[10px] font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                        {stickers[activeIndex].collectionName}
                      </span>
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
                    <div className="absolute inset-0 opacity-30 dark:opacity-20">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                          backgroundSize: '16px 16px',
                        }}
                      />
                    </div>

                    {imageErrors.has(stickers[activeIndex].id) ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                        <Sparkles className="w-8 h-8" />
                        <span className="text-xs">Image unavailable</span>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={stickers[activeIndex].imageUrl}
                        alt={stickers[activeIndex].title}
                        className="relative max-w-full max-h-full object-contain"
                        loading="lazy"
                        onError={() => handleImageError(stickers[activeIndex].id)}
                      />
                    )}
                  </div>

                  {/* Footer */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 mb-3">
                      {stickers[activeIndex].title}
                    </h3>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleView(stickers[activeIndex])
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        aria-label={`View ${stickers[activeIndex].title} sticker`}
                      >
                        <Eye size={16} />
                        <span>View</span>
                      </button>
                      <button
                        onClick={(e) => handleDownload(stickers[activeIndex], e)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 rounded-xl text-white text-sm font-medium transition-colors"
                        aria-label={`Download ${stickers[activeIndex].title} sticker`}
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handlePrev}
              className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg text-slate-700 dark:text-slate-200"
              aria-label="Previous sticker"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="text-sm text-slate-600 dark:text-slate-400">
              {activeIndex + 1} / {stickers.length}
            </span>

            <button
              onClick={handleNext}
              className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg text-slate-700 dark:text-slate-200"
              aria-label="Next sticker"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
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
