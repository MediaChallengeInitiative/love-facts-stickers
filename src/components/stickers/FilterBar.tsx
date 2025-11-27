'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Collection {
  id: string
  name: string
  slug: string
  _count?: {
    stickers: number
  }
}

interface FilterBarProps {
  collections: Collection[]
  selectedCollection: string | null
  searchQuery: string
  onCollectionChange: (collectionId: string | null) => void
  onSearchChange: (query: string) => void
  resultCount?: number
}

export function FilterBar({
  collections,
  selectedCollection,
  searchQuery,
  onCollectionChange,
  onSearchChange,
  resultCount,
}: FilterBarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const hasActiveFilter = searchQuery || selectedCollection

  return (
    <div className="space-y-3 xs:space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div
          className={cn(
            'flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg xs:rounded-xl bg-slate-100 dark:bg-slate-800/50 border transition-all duration-200',
            isSearchFocused ? 'border-pink-500 ring-2 ring-pink-500/20' : 'border-slate-300 dark:border-slate-700'
          )}
        >
          <Search className="w-4 h-4 xs:w-5 xs:h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search stickers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 bg-transparent text-sm xs:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            aria-label="Search stickers"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Results count when searching */}
      {hasActiveFilter && resultCount !== undefined && (
        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1 xs:gap-0">
          <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400">
            Found <span className="text-pink-500 dark:text-pink-400 font-semibold">{resultCount}</span> sticker{resultCount !== 1 ? 's' : ''}
            {searchQuery && <span className="hidden xs:inline"> matching &quot;{searchQuery}&quot;</span>}
          </p>
          {hasActiveFilter && (
            <button
              onClick={() => {
                onSearchChange('')
                onCollectionChange(null)
              }}
              className="text-xs xs:text-sm text-pink-500 dark:text-pink-400 hover:text-pink-400 dark:hover:text-pink-300 transition-colors self-start xs:self-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Collection Filters - Horizontally scrollable on mobile */}
      <div className="relative -mx-4 xs:mx-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 px-4 xs:px-0 xs:flex-wrap scrollbar-hide">
          <span className="flex items-center gap-1 xs:gap-1.5 text-xs xs:text-sm text-slate-500 dark:text-slate-400 mr-1 xs:mr-2 flex-shrink-0">
            <Filter size={14} className="xs:w-4 xs:h-4" />
            <span className="hidden xs:inline">Filter:</span>
          </span>

          <button
            onClick={() => onCollectionChange(null)}
            className={cn(
              'px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-xs xs:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
              selectedCollection === null
                ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25'
                : 'bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            All
          </button>

          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => onCollectionChange(collection.id)}
              className={cn(
                'px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-xs xs:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
                selectedCollection === collection.id
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/25'
                  : 'bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {collection.name}
              {collection._count && (
                <span className="ml-1 xs:ml-1.5 text-[10px] xs:text-xs opacity-75">
                  ({collection._count.stickers})
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Fade edges for scroll indication on mobile */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-slate-100 dark:from-slate-800/30 to-transparent pointer-events-none xs:hidden" />
      </div>
    </div>
  )
}
