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
            'flex items-center gap-2 xs:gap-3 px-3 xs:px-4 py-2.5 xs:py-3 rounded-lg xs:rounded-xl bg-lovefacts-turquoise/5 dark:bg-lovefacts-turquoise/10 border transition-all duration-200',
            isSearchFocused ? 'border-lovefacts-turquoise ring-2 ring-lovefacts-turquoise/20' : 'border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30'
          )}
        >
          <Search className="w-4 h-4 xs:w-5 xs:h-5 text-lovefacts-teal/50 dark:text-lovefacts-turquoise/50 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search stickers..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="flex-1 bg-transparent text-sm xs:text-base text-lovefacts-teal dark:text-white placeholder-lovefacts-teal/40 dark:placeholder-lovefacts-turquoise/40 focus:outline-none"
            aria-label="Search stickers"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 rounded-lg hover:bg-lovefacts-turquoise/10 dark:hover:bg-lovefacts-turquoise/20 text-lovefacts-teal/50 hover:text-lovefacts-teal dark:text-lovefacts-turquoise/50 dark:hover:text-white transition-colors"
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
          <p className="text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70">
            Found <span className="text-lovefacts-coral dark:text-lovefacts-coral font-semibold">{resultCount}</span> sticker{resultCount !== 1 ? 's' : ''}
            {searchQuery && <span className="hidden xs:inline"> matching &quot;{searchQuery}&quot;</span>}
          </p>
          {hasActiveFilter && (
            <button
              onClick={() => {
                onSearchChange('')
                onCollectionChange(null)
              }}
              className="text-xs xs:text-sm text-lovefacts-coral dark:text-lovefacts-coral hover:text-lovefacts-coral-dark dark:hover:text-lovefacts-coral-light transition-colors self-start xs:self-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Collection Filters - Horizontally scrollable on mobile */}
      <div className="relative -mx-4 xs:mx-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 px-4 xs:px-0 xs:flex-wrap scrollbar-hide">
          <span className="flex items-center gap-1 xs:gap-1.5 text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 mr-1 xs:mr-2 flex-shrink-0">
            <Filter size={14} className="xs:w-4 xs:h-4" />
            <span className="hidden xs:inline">Filter:</span>
          </span>

          <button
            onClick={() => onCollectionChange(null)}
            className={cn(
              'px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-xs xs:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
              selectedCollection === null
                ? 'bg-gradient-to-r from-lovefacts-coral to-lovefacts-coral-dark text-white shadow-lg shadow-lovefacts-coral/25'
                : 'bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 text-lovefacts-teal dark:text-lovefacts-turquoise-light hover:bg-lovefacts-turquoise/20 dark:hover:bg-lovefacts-turquoise/30 hover:text-lovefacts-teal-dark dark:hover:text-white'
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
                  ? 'bg-gradient-to-r from-lovefacts-coral to-lovefacts-coral-dark text-white shadow-lg shadow-lovefacts-coral/25'
                  : 'bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 text-lovefacts-teal dark:text-lovefacts-turquoise-light hover:bg-lovefacts-turquoise/20 dark:hover:bg-lovefacts-turquoise/30 hover:text-lovefacts-teal-dark dark:hover:text-white'
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
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white dark:from-lovefacts-teal-dark/30 to-transparent pointer-events-none xs:hidden" />
      </div>
    </div>
  )
}
