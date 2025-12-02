'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderOpen, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreviewSticker {
  id: string
  thumbnailUrl: string
  title: string
}

interface CollectionCardProps {
  id: string
  name: string
  slug: string
  description?: string
  coverImage?: string
  stickerCount: number
  previewStickers?: PreviewSticker[]
  onClick: () => void
  className?: string
}

export function CollectionCard({
  name,
  description,
  stickerCount,
  previewStickers = [],
  onClick,
  className,
}: CollectionCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-flip through images
  useEffect(() => {
    if (!isAutoPlaying || previewStickers.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % previewStickers.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [isAutoPlaying, previewStickers.length])

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + previewStickers.length) % previewStickers.length)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % previewStickers.length)
  }

  return (
    <motion.div
      className={cn(
        'group relative bg-gradient-to-br from-white to-lovefacts-turquoise/5 dark:from-lovefacts-teal dark:to-lovefacts-teal-dark rounded-xl xs:rounded-2xl overflow-hidden',
        'border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 cursor-pointer transition-all duration-300',
        'hover:border-lovefacts-coral/50 hover:shadow-xl hover:shadow-lovefacts-coral/20',
        className
      )}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`Browse ${name} collection`}
    >
      {/* Flip Gallery Preview */}
      <div className="relative h-32 xs:h-40 overflow-hidden bg-lovefacts-turquoise/5 dark:bg-lovefacts-teal-dark/50">
        {previewStickers.length > 0 ? (
          <>
            {/* Image Carousel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                className="absolute inset-0 flex items-center justify-center p-4"
                style={{ perspective: '1000px' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewStickers[currentIndex]?.thumbnailUrl}
                  alt={previewStickers[currentIndex]?.title || 'Sticker preview'}
                  className="max-h-full max-w-full object-contain drop-shadow-2xl"
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows - Show on hover */}
            {previewStickers.length > 1 && isHovered && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all z-10"
                  aria-label="Previous sticker"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all z-10"
                  aria-label="Next sticker"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Dots Indicator */}
            {previewStickers.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {previewStickers.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsAutoPlaying(false)
                      setCurrentIndex(idx)
                    }}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      idx === currentIndex
                        ? 'bg-lovefacts-coral w-4'
                        : 'bg-white/40 hover:bg-white/60'
                    )}
                    aria-label={`Go to sticker ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          // Fallback gradient if no preview stickers
          <div className="absolute inset-0 bg-gradient-to-br from-lovefacts-coral/30 via-lovefacts-turquoise/20 to-lovefacts-green/30 flex items-center justify-center">
            <FolderOpen size={48} className="text-white/20" />
          </div>
        )}

        {/* Top gradient overlay */}
        <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-lovefacts-turquoise/10 dark:from-lovefacts-teal-dark/60 to-transparent" />

        {/* Sticker Count Badge */}
        <div className="absolute top-2 right-2 xs:top-3 xs:right-3 flex items-center gap-1 xs:gap-1.5 px-2 xs:px-3 py-0.5 xs:py-1 bg-lovefacts-teal/80 backdrop-blur-sm rounded-full">
          <FolderOpen size={12} className="xs:w-[14px] xs:h-[14px] text-lovefacts-turquoise" />
          <span className="text-xs xs:text-sm font-medium text-white">{stickerCount}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 xs:p-4">
        <h3 className="text-sm xs:text-base font-bold text-lovefacts-teal dark:text-white mb-0.5 xs:mb-1 group-hover:text-lovefacts-coral dark:group-hover:text-lovefacts-coral transition-colors line-clamp-1">
          {name}
        </h3>
        {description && (
          <p className="text-[10px] xs:text-xs text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 line-clamp-2 mb-2 xs:mb-3">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] xs:text-xs text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60">
            {stickerCount} sticker{stickerCount !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1 xs:gap-1.5 text-[10px] xs:text-xs text-lovefacts-coral dark:text-lovefacts-coral font-medium group-hover:text-lovefacts-coral-dark dark:group-hover:text-lovefacts-coral-light transition-colors">
            <Download size={10} className="xs:w-3 xs:h-3" />
            Browse
          </span>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-lovefacts-coral/10 to-transparent" />
      </div>
    </motion.div>
  )
}
