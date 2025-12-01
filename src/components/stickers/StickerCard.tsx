'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Eye } from 'lucide-react'
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
        'group relative bg-white dark:bg-slate-800/50 rounded-xl xs:rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50',
        'cursor-pointer transition-all duration-300 flex flex-col',
        'hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10',
        className
      )}
      whileHover={{ y: -4 }}
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
      aria-label={`View sticker: ${title}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square p-3 xs:p-4 flex-shrink-0">
        {/* Loading skeleton */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-3 xs:inset-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg xs:rounded-xl" />
        )}

        {/* Error placeholder */}
        {hasError && (
          <div className="absolute inset-3 xs:inset-4 bg-slate-200 dark:bg-slate-700 rounded-lg xs:rounded-xl flex items-center justify-center">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] xs:text-xs text-center px-2">Image unavailable</span>
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={title}
          className={cn(
            'absolute inset-3 xs:inset-4 w-[calc(100%-1.5rem)] xs:w-[calc(100%-2rem)] h-[calc(100%-1.5rem)] xs:h-[calc(100%-2rem)] object-contain transition-all duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            isHovered && 'scale-105'
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
        />

        {/* Hover Overlay - Desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent hidden md:flex items-end justify-center pb-4"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              <Eye size={14} />
              Preview
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 rounded-full text-white text-sm font-medium">
              <Download size={14} />
              Download
            </span>
          </div>
        </motion.div>
      </div>

      {/* Card Footer - Always visible */}
      <div className="px-3 pb-3 xs:px-4 xs:pb-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-xs xs:text-sm font-medium text-slate-900 dark:text-white line-clamp-2 mb-1">{title}</h3>
          <p className="text-[10px] xs:text-xs text-slate-500 dark:text-slate-400 truncate">{collectionName}</p>
        </div>

        {/* Mobile action buttons - Always visible on small screens */}
        <div className="flex items-center gap-2 mt-2 md:hidden">
          <span className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-slate-600 dark:text-slate-300 text-[10px] xs:text-xs font-medium">
            <Eye size={12} />
            Preview
          </span>
          <span className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 bg-pink-500 rounded-lg text-white text-[10px] xs:text-xs font-medium">
            <Download size={12} />
            Download
          </span>
        </div>
      </div>
    </motion.div>
  )
}
