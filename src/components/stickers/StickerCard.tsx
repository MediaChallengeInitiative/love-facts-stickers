'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Eye, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  return (
    <motion.div
      className={cn(
        'group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden',
        'border border-slate-200 dark:border-slate-700',
        'cursor-pointer transition-all duration-300',
        'hover:border-pink-400 dark:hover:border-pink-500',
        'hover:shadow-xl hover:shadow-pink-500/10',
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
      <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '16px 16px',
          }} />
        </div>

        {/* Loading skeleton */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl" />
        )}

        {/* Error placeholder */}
        {hasError && (
          <div className="absolute inset-4 bg-slate-200 dark:bg-slate-700 rounded-xl flex flex-col items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-slate-400" />
            <span className="text-slate-400 dark:text-slate-500 text-xs text-center px-2">
              Image unavailable
            </span>
          </div>
        )}

        {/* Sticker Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={title}
          className={cn(
            'absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-contain',
            'transition-all duration-500 ease-out',
            isLoaded ? 'opacity-100' : 'opacity-0',
            isHovered && 'scale-110'
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
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
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-500 rounded-full text-white text-sm font-medium shadow-lg shadow-pink-500/30">
              <Download size={16} />
              Download
            </span>
          </motion.div>
        </motion.div>

        {/* Collection badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-[10px] font-medium text-slate-600 dark:text-slate-300 shadow-sm">
            {collectionName}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-2 xs:p-3 sm:p-4">
        {/* Title */}
        <h3 className="text-xs xs:text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 mb-2 xs:mb-3 leading-tight">
          {title}
        </h3>

        {/* Action Buttons - Always visible, responsive sizing */}
        <div className="flex items-center gap-1 xs:gap-2 w-full">
          <button
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-1.5 xs:px-2 sm:px-3 py-1.5 xs:py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg xs:rounded-xl text-slate-700 dark:text-slate-200 text-[10px] xs:text-xs font-medium transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <Eye size={12} className="flex-shrink-0" />
            <span className="truncate">Preview</span>
          </button>
          <button
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-1.5 xs:px-2 sm:px-3 py-1.5 xs:py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 rounded-lg xs:rounded-xl text-white text-[10px] xs:text-xs font-medium transition-all shadow-sm shadow-pink-500/20 hover:shadow-md hover:shadow-pink-500/30"
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
