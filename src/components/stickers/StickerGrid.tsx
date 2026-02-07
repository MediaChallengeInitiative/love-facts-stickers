'use client'

import { StickerCard } from './StickerCard'
import { motion } from 'framer-motion'
import type { Sticker } from '@/lib/types'

interface StickerGridProps {
  stickers: Sticker[]
  onStickerClick: (sticker: Sticker) => void
}

interface StickerGridExtendedProps extends StickerGridProps {
  isLoading?: boolean
  selectedCollection?: string | null
}

export function StickerGrid({ stickers, onStickerClick, isLoading, selectedCollection }: StickerGridExtendedProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden animate-pulse border border-slate-200 dark:border-slate-700">
            <div className="aspect-square bg-slate-100 dark:bg-slate-900" />
            <div className="p-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
              <div className="flex gap-2">
                <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (stickers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 mb-4 rounded-full bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-slate-400 dark:text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No stickers found</h3>
        <p className="text-slate-500 dark:text-slate-400">
          {selectedCollection
            ? 'This collection is empty or stickers are still loading. Try selecting "All Stickers" or a different collection.'
            : 'Try adjusting your search or filter criteria'}
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 xs:gap-4"
    >
      {stickers.map((sticker, index) => (
        <motion.div
          key={sticker.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <StickerCard
            id={sticker.id}
            title={sticker.title}
            thumbnailUrl={sticker.thumbnailUrl}
            collectionName={sticker.collection?.name || 'Uncategorized'}
            onClick={() => onStickerClick(sticker)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
