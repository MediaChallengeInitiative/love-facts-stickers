'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Download, Eye, Sparkles, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_RETRIES = 3
const RETRY_DELAYS = [1000, 3000, 6000] // Escalating delays

interface StickerCardProps {
  id: string
  title: string
  thumbnailUrl: string
  collectionName: string
  onClick: () => void
  className?: string
}

export function StickerCard({
  title,
  thumbnailUrl,
  collectionName,
  onClick,
  className,
}: StickerCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const retryCount = useRef(0)
  const imgRef = useRef<HTMLImageElement>(null)

  const retryLoad = useCallback(() => {
    if (retryCount.current >= MAX_RETRIES) return
    setIsRetrying(true)
    const delay = RETRY_DELAYS[retryCount.current] || 6000
    setTimeout(() => {
      retryCount.current++
      setHasError(false)
      setIsLoaded(false)
      setIsRetrying(false)
      // Force reload by appending a cache-busting param
      if (imgRef.current) {
        const separator = thumbnailUrl.includes('?') ? '&' : '?'
        imgRef.current.src = `${thumbnailUrl}${separator}_t=${Date.now()}`
      }
    }, delay)
  }, [thumbnailUrl])

  const handleError = useCallback(() => {
    if (retryCount.current < MAX_RETRIES) {
      retryLoad()
    } else {
      setHasError(true)
      setIsRetrying(false)
    }
  }, [retryLoad])

  const handleManualRetry = useCallback(() => {
    retryCount.current = 0
    setHasError(false)
    setIsLoaded(false)
    setIsRetrying(false)
    if (imgRef.current) {
      const separator = thumbnailUrl.includes('?') ? '&' : '?'
      imgRef.current.src = `${thumbnailUrl}${separator}_t=${Date.now()}`
    }
  }, [thumbnailUrl])

  return (
    <motion.div
      className={cn(
        'group relative bg-white dark:bg-lovefacts-teal rounded-2xl overflow-hidden',
        'border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30',
        'cursor-pointer transition-all duration-300',
        'hover:border-lovefacts-coral dark:hover:border-lovefacts-coral',
        'hover:shadow-xl hover:shadow-lovefacts-coral/10',
        'active:scale-[0.98]',
        className
      )}
      whileHover={{ y: -6 }}
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
      aria-label={`View sticker: ${title}`}
    >
      {/* Image Container with gradient background */}
      <div className="relative aspect-square bg-gradient-to-br from-white to-lovefacts-turquoise/5 dark:from-lovefacts-teal-dark dark:to-lovefacts-teal">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }} />
        </div>

        {/* Loading skeleton */}
        {(!isLoaded && !hasError) && (
          <div className="absolute inset-4 bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 animate-pulse rounded-xl flex items-center justify-center">
            {isRetrying && (
              <RefreshCw className="w-5 h-5 text-lovefacts-turquoise/40 animate-spin" />
            )}
          </div>
        )}

        {/* Error placeholder with retry button */}
        {hasError && (
          <div className="absolute inset-4 bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 rounded-xl flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-lovefacts-turquoise/50" />
            <span className="text-lovefacts-teal/50 dark:text-lovefacts-turquoise/50 text-xs text-center px-2">
              Image unavailable
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleManualRetry()
              }}
              className="mt-1 flex items-center gap-1 px-2 py-1 text-[10px] bg-lovefacts-turquoise/20 hover:bg-lovefacts-turquoise/30 rounded-full text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60 transition-colors"
            >
              <RefreshCw size={10} />
              Retry
            </button>
          </div>
        )}

        {/* Sticker Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={thumbnailUrl}
          alt={title}
          className={cn(
            'absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-contain',
            'transition-all duration-500 ease-out',
            isLoaded ? 'opacity-100' : 'opacity-0',
            isHovered && 'scale-110'
          )}
          onLoad={() => { setIsLoaded(true); setIsRetrying(false) }}
          onError={handleError}
          loading="lazy"
        />

        {/* Hover Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center p-4"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center gap-2"
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20">
              <Eye size={16} />
              Preview
            </span>
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-lovefacts-coral rounded-full text-white text-sm font-medium shadow-lg shadow-lovefacts-coral/30">
              <Download size={16} />
              Download
            </span>
          </motion.div>
        </motion.div>

        {/* Collection badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-white/90 dark:bg-lovefacts-teal/90 backdrop-blur-sm rounded-full text-[10px] font-medium text-lovefacts-teal dark:text-lovefacts-turquoise-light shadow-sm">
            {collectionName}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-2 xs:p-3 sm:p-4">
        {/* Title */}
        <h3 className="text-xs xs:text-sm font-semibold text-lovefacts-teal dark:text-white line-clamp-1 mb-2 xs:mb-3 leading-tight">
          {title}
        </h3>

        {/* Action Buttons - Always visible, responsive sizing */}
        <div className="flex items-center gap-1 xs:gap-2 w-full">
          <button
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-1.5 xs:px-2 sm:px-3 py-1.5 xs:py-2 bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 hover:bg-lovefacts-turquoise/20 dark:hover:bg-lovefacts-turquoise/30 rounded-lg xs:rounded-xl text-lovefacts-teal dark:text-lovefacts-turquoise-light text-[10px] xs:text-xs font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <Eye size={12} className="flex-shrink-0" />
            <span className="truncate">Preview</span>
          </button>
          <button
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-1.5 xs:px-2 sm:px-3 py-1.5 xs:py-2 bg-gradient-to-r from-lovefacts-coral to-lovefacts-coral-dark hover:from-lovefacts-coral-dark hover:to-lovefacts-coral rounded-lg xs:rounded-xl text-white text-[10px] xs:text-xs font-medium transition-all shadow-sm shadow-lovefacts-coral/20 hover:shadow-md hover:shadow-lovefacts-coral/30"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <Download size={12} className="flex-shrink-0" />
            <span className="truncate">Download</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
