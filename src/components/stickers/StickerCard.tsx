'use client'

// StickerCard v3 — composable, container-query responsive, accessible.
// Image uses next/image with shimmer LQIP. Long-press opens share, tap opens
// preview. Hero stickers get a flame chip; share + useful counts surface
// inline when present. Three density modes via the `density` prop.

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Download, Eye, RefreshCw, MessageCircle, Heart, Flame, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLongPress } from '@/lib/use-long-press'

export type StickerCardDensity = 'compact' | 'default' | 'feature'

interface StickerCardProps {
  id: string
  title: string
  thumbnailUrl: string
  collectionName?: string
  caption?: string | null
  isHero?: boolean
  shareCount?: number
  usefulCount?: number
  density?: StickerCardDensity
  onClick: () => void
  onDownload?: () => void
  onShare?: () => void
  className?: string
}

const USEFUL_KEY_PREFIX = 'lf:useful:'

function hasMarkedUseful(id: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(USEFUL_KEY_PREFIX + id) === '1'
  } catch {
    return false
  }
}

function markUsefulLocal(id: string) {
  try {
    localStorage.setItem(USEFUL_KEY_PREFIX + id, '1')
  } catch {
    /* ignore */
  }
}

export function StickerCard({
  id,
  title,
  thumbnailUrl,
  collectionName,
  caption,
  isHero,
  shareCount,
  usefulCount,
  density = 'default',
  onClick,
  onDownload,
  onShare,
  className,
}: StickerCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const retryCount = useRef(0)
  const [imgSrc, setImgSrc] = useState(thumbnailUrl)
  const [useful, setUseful] = useState(() => hasMarkedUseful(id))
  const [localUsefulCount, setLocalUsefulCount] = useState(usefulCount ?? 0)

  const retryLoad = useCallback(() => {
    if (retryCount.current >= 3) {
      setHasError(true)
      return
    }
    retryCount.current += 1
    const sep = thumbnailUrl.includes('?') ? '&' : '?'
    setImgSrc(`${thumbnailUrl}${sep}_t=${Date.now()}`)
  }, [thumbnailUrl])

  const longPress = useLongPress(
    () => {
      if (onShare) onShare()
    },
    { threshold: 450 }
  )

  const handleCardClick = useCallback(() => {
    // Don't open preview if a long-press just fired share.
    if (longPress.didFire()) return
    onClick()
  }, [onClick, longPress])

  const handleUseful = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation()
      if (useful) return
      setUseful(true)
      setLocalUsefulCount((c) => c + 1)
      markUsefulLocal(id)
      fetch(`/api/sticker/${id}/useful`, { method: 'POST' }).catch(() => undefined)
    },
    [id, useful]
  )

  const iconSize = density === 'compact' ? 14 : density === 'feature' ? 18 : 16

  return (
    <motion.article
      role="article"
      aria-labelledby={`sticker-title-${id}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        } else if (e.key === 's' && onShare) {
          e.preventDefault()
          onShare()
        }
      }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleCardClick}
      {...longPress}
      className={cn(
        '@container group relative bg-white dark:bg-lovefacts-teal rounded-2xl overflow-hidden',
        'border transition-all duration-300 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lovefacts-coral focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-lovefacts-teal-dark',
        isHero
          ? 'border-lovefacts-coral/40 dark:border-lovefacts-coral/50 shadow-md shadow-lovefacts-coral/10 hover:shadow-xl hover:shadow-lovefacts-coral/20'
          : 'border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 hover:border-lovefacts-coral/60 hover:shadow-xl hover:shadow-lovefacts-coral/10',
        'motion-reduce:hover:transform-none',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-white to-lovefacts-turquoise/5 dark:from-lovefacts-teal-dark dark:to-lovefacts-teal">
        {/* Dotted decorative pattern */}
        <div className="absolute inset-0 opacity-20 dark:opacity-15 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
              backgroundSize: '16px 16px',
            }}
          />
        </div>

        {/* Shimmer skeleton — sticker-shaped, centred, brand-colored */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-3 @sm:inset-4 rounded-xl bg-shimmer animate-shimmer" aria-hidden="true" />
        )}

        {hasError ? (
          <div className="absolute inset-3 @sm:inset-4 rounded-xl bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 flex flex-col items-center justify-center gap-1.5">
            <span className="text-[10px] text-lovefacts-teal/50 dark:text-lovefacts-turquoise/50 text-center px-2">
              Image unavailable
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                retryCount.current = 0
                setHasError(false)
                setIsLoaded(false)
                setImgSrc(`${thumbnailUrl}${thumbnailUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`)
              }}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-lovefacts-coral text-white hover:bg-lovefacts-coral-dark"
              aria-label="Retry loading image"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        ) : (
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn(
              'object-contain p-3 @sm:p-4 transition-opacity duration-500',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setIsLoaded(true)}
            onError={() => {
              if (retryCount.current < 3) retryLoad()
              else setHasError(true)
            }}
            unoptimized
          />
        )}

        {/* Top-left: collection badge */}
        {collectionName && (
          <div className="absolute top-2 left-2 max-w-[60%]">
            <span className="inline-flex items-center px-2 py-0.5 bg-white/90 dark:bg-lovefacts-teal/90 backdrop-blur-sm rounded-full text-[9px] @sm:text-[10px] font-medium text-lovefacts-teal dark:text-lovefacts-turquoise-light shadow-sm truncate max-w-full">
              {collectionName}
            </span>
          </div>
        )}

        {/* Top-right: hero flame chip or share-count chip */}
        {isHero ? (
          <div className="absolute top-2 right-2">
            <span
              className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-lovefacts-coral text-white rounded-full text-[9px] @sm:text-[10px] font-bold shadow-md"
              title="Featured sticker"
            >
              <Flame size={10} aria-hidden="true" />
              <span className="hidden @[8rem]:inline">HOT</span>
            </span>
          </div>
        ) : (
          !!shareCount &&
          shareCount > 0 && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white rounded-full text-[9px] @sm:text-[10px] font-semibold">
                <Share2 size={9} aria-hidden="true" />
                {shareCount}
              </span>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div className="p-2 @sm:p-3 @md:p-4">
        <div className="flex items-start justify-between gap-2 mb-2 @sm:mb-3">
          <div className="min-w-0 flex-1">
            <h3
              id={`sticker-title-${id}`}
              className={cn(
                'font-semibold text-lovefacts-teal dark:text-white leading-tight line-clamp-1',
                density === 'compact' ? 'text-[11px]' : 'text-xs @sm:text-sm'
              )}
            >
              {title}
            </h3>
            {density === 'feature' && caption && (
              <p className="hidden @md:block text-[11px] text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60 line-clamp-1 mt-0.5 italic">
                {caption}
              </p>
            )}
          </div>

          {/* Useful (💚) — toggle, debounced per-device */}
          <button
            onClick={handleUseful}
            disabled={useful}
            className={cn(
              'shrink-0 inline-flex items-center gap-0.5 px-1.5 py-1 rounded-full text-[10px] font-semibold transition-all',
              useful
                ? 'bg-lovefacts-green text-white cursor-default'
                : 'bg-lovefacts-green/10 text-lovefacts-green-dark dark:text-lovefacts-green-light hover:bg-lovefacts-green/20 active:scale-95'
            )}
            aria-label={useful ? 'Marked useful' : 'Mark as useful'}
            aria-pressed={useful}
            title={useful ? 'You marked this useful' : 'Mark as useful'}
          >
            <Heart size={10} fill={useful ? 'currentColor' : 'none'} aria-hidden="true" />
            {localUsefulCount > 0 && <span>{localUsefulCount}</span>}
          </button>
        </div>

        {/* Actions — icon-only by default, label-bearing in feature density */}
        <div className="flex items-center justify-center gap-1.5 @sm:gap-2 w-full">
          <ActionButton
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            label="Preview"
            density={density}
            variant="ghost"
            ariaLabel={`Preview ${title}`}
          >
            <Eye size={iconSize} />
          </ActionButton>

          <ActionButton
            onClick={(e) => {
              e.stopPropagation()
              if (onDownload) onDownload()
              else onClick()
            }}
            label="Save"
            density={density}
            variant="primary"
            ariaLabel={`Save ${title}`}
          >
            <Download size={iconSize} />
          </ActionButton>

          {onShare && (
            <ActionButton
              onClick={(e) => {
                e.stopPropagation()
                onShare()
              }}
              label="Share"
              density={density}
              variant="success"
              ariaLabel={`Share ${title}`}
            >
              <MessageCircle size={iconSize} />
            </ActionButton>
          )}
        </div>
      </div>
    </motion.article>
  )
}

// Internal button — keeps the three action triggers visually consistent and
// makes the "feature density shows labels" behavior a single line of code.
function ActionButton({
  onClick,
  children,
  label,
  density,
  variant,
  ariaLabel,
}: {
  onClick: (e: React.MouseEvent) => void
  children: React.ReactNode
  label: string
  density: StickerCardDensity
  variant: 'primary' | 'ghost' | 'success'
  ariaLabel: string
}) {
  const showLabel = density === 'feature'
  const base = 'flex-1 min-w-0 inline-flex items-center justify-center gap-1 rounded-lg @sm:rounded-xl transition-all min-h-[36px] @sm:min-h-[40px]'
  const sizeCls = showLabel ? 'py-2 px-3 text-xs font-semibold' : 'py-2 @sm:py-2.5'
  const variantCls = {
    primary:
      'bg-gradient-to-r from-lovefacts-coral to-lovefacts-coral-dark hover:from-lovefacts-coral-dark hover:to-lovefacts-coral text-white shadow-sm shadow-lovefacts-coral/20 hover:shadow-md hover:shadow-lovefacts-coral/30 active:scale-95',
    ghost:
      'bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 hover:bg-lovefacts-turquoise/20 dark:hover:bg-lovefacts-turquoise/30 text-lovefacts-teal dark:text-lovefacts-turquoise-light active:scale-95',
    success:
      'bg-lovefacts-green/10 hover:bg-lovefacts-green/20 dark:bg-lovefacts-green/20 dark:hover:bg-lovefacts-green/30 text-lovefacts-green-dark dark:text-lovefacts-green-light active:scale-95',
  }[variant]

  return (
    <button onClick={onClick} className={cn(base, sizeCls, variantCls)} aria-label={ariaLabel} title={label}>
      {children}
      {showLabel && <span className="truncate">{label}</span>}
    </button>
  )
}
