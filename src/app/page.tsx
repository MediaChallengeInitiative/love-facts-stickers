'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Hero } from '@/components/layout/Hero'
import { StickerGrid } from '@/components/stickers/StickerGrid'
import { FilterBar } from '@/components/stickers/FilterBar'
import { HeroSpotlight } from '@/components/stickers/HeroSpotlight'
import { DensityToggle } from '@/components/stickers/DensityToggle'
import { StackedGallery } from '@/components/StickerCollections/StackedGallery'
import type { StickerCardDensity } from '@/components/stickers/StickerCard'
import { StickerPreviewModal } from '@/components/modals/StickerPreviewModal'
import { ShareSheet } from '@/components/share/ShareSheet'
import toast from 'react-hot-toast'
import { MessageCircle } from 'lucide-react'
import type { Sticker, Collection } from '@/lib/types'
import { downloadSticker } from '@/lib/download'
import { getStickerShareUrl } from '@/lib/urls'

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [shareSubject, setShareSubject] = useState<Sticker | null>(null)
  const [density, setDensity] = useState<StickerCardDensity>('default')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lf:density') as StickerCardDensity | null
      if (stored === 'compact' || stored === 'default' || stored === 'feature') {
        setDensity(stored)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const handleDensityChange = useCallback((d: StickerCardDensity) => {
    setDensity(d)
    try {
      localStorage.setItem('lf:density', d)
    } catch {
      /* ignore */
    }
  }, [])

  const galleryRef = useRef<HTMLDivElement>(null)
  const hasSynced = useRef(false)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const cacheBuster = `_t=${Date.now()}`
      const [collectionsRes, stickersRes] = await Promise.all([
        fetch(`/api/collections?${cacheBuster}`),
        fetch(`/api/stickers?limit=500&${cacheBuster}`),
      ])

      if (collectionsRes.ok) {
        const collectionsData = await collectionsRes.json()
        const collectionsArray = Array.isArray(collectionsData)
          ? collectionsData
          : collectionsData.collections || []
        setCollections(collectionsArray)
      }

      if (stickersRes.ok) {
        const stickersData = await stickersRes.json()
        const stickersArray = Array.isArray(stickersData)
          ? stickersData
          : stickersData.stickers || []
        setStickers(stickersArray)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      if (showLoading) toast.error('Failed to load stickers')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    if (!hasSynced.current) {
      hasSynced.current = true
      fetch('/api/sync/auto', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'synced' && data.itemsSynced > 0) {
            fetchData(false)
          }
        })
        .catch((err) => console.warn('Auto-sync failed:', err))
    }
  }, [fetchData])

  useEffect(() => {
    pollIntervalRef.current = setInterval(() => {
      fetchData(false)
    }, 30000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [fetchData])

  const filteredStickers = useMemo(() => {
    return stickers.filter((sticker) => {
      const stickerCollectionId = sticker.collectionId || sticker.collection?.id
      const matchesCollection = !selectedCollection || stickerCollectionId === selectedCollection
      const matchesSearch =
        !searchQuery ||
        sticker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sticker.tags && sticker.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      return matchesCollection && matchesSearch
    })
  }, [stickers, selectedCollection, searchQuery])

  const handleBrowseClick = () => {
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleStickerClick = (sticker: Sticker) => {
    setSelectedSticker(sticker)
    setShowPreviewModal(true)
  }

  // One-tap save: download lands, toast surfaces a WhatsApp button so the
  // next move (share onward) is obvious and one tap away.
  const handleStickerDownload = useCallback(
    async (sticker: Sticker, type: 'single' | 'collection' = 'single') => {
      await downloadSticker(sticker, { downloadType: type })

      const shareUrl = getStickerShareUrl(sticker.id)
      const text = sticker.caption || `Check out: ${sticker.title} — from Love Facts`
      const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`

      toast.custom(
        (t) => (
          <div
            className={`max-w-sm w-full bg-white dark:bg-lovefacts-teal shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-lovefacts-turquoise/30 ${
              t.visible ? 'animate-enter' : 'animate-leave'
            }`}
          >
            <div className="flex-1 p-4 flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-lovefacts-teal dark:text-white">Saved</p>
                <p className="text-xs text-lovefacts-teal/60 dark:text-lovefacts-turquoise/70 truncate">
                  {sticker.title}
                </p>
              </div>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => toast.dismiss(t.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-lovefacts-green text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-lovefacts-green-dark transition-colors"
              >
                <MessageCircle size={14} />
                Send
              </a>
            </div>
          </div>
        ),
        { duration: 4500 }
      )
    },
    []
  )

  // Quick share — opens the multi-channel share sheet.
  const handleStickerShare = useCallback((sticker: Sticker) => {
    setShareSubject(sticker)
  }, [])

  return (
    <div className="min-h-[100svh]">
      <Hero onBrowseClick={handleBrowseClick} />

      <HeroSpotlight
        onPreview={(s) => {
          setSelectedSticker(s)
          setShowPreviewModal(true)
        }}
        onShare={(s) => setShareSubject(s)}
      />

      <section
        id="collections"
        className="py-10 xs:py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        aria-labelledby="stickers-heading"
      >
        <div className="text-center mb-8 xs:mb-10 sm:mb-12">
          <h2 id="stickers-heading" className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white mb-3 xs:mb-4">
            Sticker Collections
          </h2>
          <p className="text-sm xs:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto px-2">
            Browse our curated collections of media literacy stickers. Each collection has a unique theme to help you
            fight misinformation in different ways.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-700/50 animate-pulse" />
                <div className="p-3 sm:p-4">
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-1 animate-pulse" />
                  <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-3 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    <div className="flex-1 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <StackedGallery
            stickers={stickers.map((s) => ({
              id: s.id,
              title: s.title,
              imageUrl: s.thumbnailUrl,
              collectionId: s.collectionId,
              collectionName: s.collection?.name,
            }))}
            collections={collections.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              count: c._count?.stickers || 0,
            }))}
            onDownload={(id) => {
              const sticker = stickers.find((s) => s.id === id)
              if (sticker) handleStickerDownload(sticker, 'single')
            }}
          />
        )}
      </section>

      <section
        ref={galleryRef}
        id="gallery"
        className="py-10 xs:py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-800/30"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 xs:mb-8">
            <h2 className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white mb-3 xs:mb-4">All Stickers</h2>
            <p className="text-sm xs:text-base text-slate-500 dark:text-slate-400">
              Tap any sticker to preview. Tap Save to download instantly. No signup required.
            </p>
          </div>

          <div className="mb-6 xs:mb-8">
            <FilterBar
              collections={collections}
              selectedCollection={selectedCollection}
              searchQuery={searchQuery}
              onCollectionChange={setSelectedCollection}
              onSearchChange={setSearchQuery}
              resultCount={filteredStickers.length}
            />
            <div className="hidden md:flex items-center justify-end mt-3">
              <DensityToggle value={density} onChange={handleDensityChange} />
            </div>
          </div>

          <StickerGrid
            stickers={filteredStickers}
            onStickerClick={handleStickerClick}
            onStickerDownload={(s) => handleStickerDownload(s, 'single')}
            onStickerShare={handleStickerShare}
            isLoading={isLoading}
            selectedCollection={selectedCollection}
            density={density}
          />
        </div>
      </section>

      <StickerPreviewModal
        sticker={selectedSticker}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onDownload={(sticker, type) => handleStickerDownload(sticker, type)}
      />

      <ShareSheet
        open={!!shareSubject}
        onClose={() => setShareSubject(null)}
        subject={
          shareSubject
            ? {
                id: shareSubject.id,
                title: shareSubject.title,
                url: getStickerShareUrl(shareSubject.id),
                caption: shareSubject.caption,
                imageUrl: shareSubject.sourceUrl,
              }
            : { id: '', title: '', url: '' }
        }
      />
    </div>
  )
}
