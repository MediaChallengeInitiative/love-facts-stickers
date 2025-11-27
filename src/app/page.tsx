'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Hero } from '@/components/layout/Hero'
import { StickerGrid } from '@/components/stickers/StickerGrid'
import { FilterBar } from '@/components/stickers/FilterBar'
import { CollectionCard } from '@/components/stickers/CollectionCard'
import { StickerPreviewModal } from '@/components/modals/StickerPreviewModal'
import { DownloadGatingModal } from '@/components/modals/DownloadGatingModal'
import { DownloadSuccessModal } from '@/components/modals/DownloadSuccessModal'
import toast from 'react-hot-toast'
import type { Sticker, Collection } from '@/lib/types'

export default function HomePage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [downloadType, setDownloadType] = useState<'single' | 'collection'>('single')
  const [isDownloading, setIsDownloading] = useState(false)

  const galleryRef = useRef<HTMLDivElement>(null)

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [collectionsRes, stickersRes] = await Promise.all([
        fetch('/api/collections'),
        fetch('/api/stickers'),
      ])

      if (collectionsRes.ok) {
        const collectionsData = await collectionsRes.json()
        setCollections(collectionsData.collections || collectionsData)
      }

      if (stickersRes.ok) {
        const stickersData = await stickersRes.json()
        setStickers(stickersData.stickers || stickersData)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Failed to load stickers')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Filter stickers based on collection and search
  const filteredStickers = useMemo(() => {
    return stickers.filter((sticker) => {
      const matchesCollection = !selectedCollection || sticker.collection.id === selectedCollection
      const matchesSearch =
        !searchQuery ||
        sticker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sticker.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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

  const handleDownloadRequest = (sticker: Sticker, type: 'single' | 'collection') => {
    setSelectedSticker(sticker)
    setDownloadType(type)
    setShowPreviewModal(false)
    setShowDownloadModal(true)
  }

  const handleDownloadSubmit = async (data: {
    email?: string
    phone?: string
    name?: string
    isAnonymous: boolean
  }) => {
    if (!selectedSticker) return

    setIsDownloading(true)

    try {
      // In production, this would call the API
      await fetch('/api/download-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stickerId: selectedSticker.id,
          email: data.email,
          phone: data.phone,
          name: data.name,
          isAnonymous: data.isAnonymous,
          downloadType,
        }),
      })

      // For demo, simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Trigger download
      const link = document.createElement('a')
      link.href = selectedSticker.sourceUrl
      link.download = `${selectedSticker.title.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setShowDownloadModal(false)
      setShowSuccessModal(true)

      toast.success('Download started!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Download failed. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCollectionClick = (collectionId: string) => {
    setSelectedCollection(collectionId)
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero onBrowseClick={handleBrowseClick} />

      {/* Collections Section */}
      <section id="collections" className="py-10 xs:py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8 xs:mb-10 sm:mb-12">
          <h2 className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white mb-3 xs:mb-4">Sticker Collections</h2>
          <p className="text-sm xs:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto px-2">
            Browse our curated collections of media literacy stickers. Each collection has a unique theme
            to help you fight misinformation in different ways.
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 xs:gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-slate-200 dark:bg-slate-800/50 rounded-2xl p-6 animate-pulse">
                <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded mb-4" />
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4" />
              </div>
            ))
          ) : collections.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400">
              No collections found. Try syncing from Google Drive.
            </div>
          ) : (
            collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                id={collection.id}
                name={collection.name}
                slug={collection.slug}
                description={collection.description || undefined}
                coverImage={collection.coverImage || undefined}
                stickerCount={collection._count?.stickers || 0}
                previewStickers={collection.previewStickers}
                onClick={() => handleCollectionClick(collection.id)}
              />
            ))
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section
        ref={galleryRef}
        id="gallery"
        className="py-10 xs:py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-800/30"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 xs:mb-8">
            <h2 className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white mb-3 xs:mb-4">All Stickers</h2>
            <p className="text-sm xs:text-base text-slate-500 dark:text-slate-400">
              Click on any sticker to preview and download
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mb-8">
            <FilterBar
              collections={collections}
              selectedCollection={selectedCollection}
              searchQuery={searchQuery}
              onCollectionChange={setSelectedCollection}
              onSearchChange={setSearchQuery}
              resultCount={filteredStickers.length}
            />
          </div>

          {/* Sticker Grid */}
          <StickerGrid
            stickers={filteredStickers}
            onStickerClick={handleStickerClick}
            isLoading={isLoading}
            selectedCollection={selectedCollection}
          />
        </div>
      </section>

      {/* Modals */}
      <StickerPreviewModal
        sticker={selectedSticker}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onDownload={handleDownloadRequest}
      />

      <DownloadGatingModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onSubmit={handleDownloadSubmit}
        isLoading={isDownloading}
        downloadType={downloadType}
        itemName={
          downloadType === 'single'
            ? selectedSticker?.title || ''
            : selectedSticker?.collection.name || ''
        }
      />

      <DownloadSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        stickerName={selectedSticker?.title || ''}
        shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/sticker/${selectedSticker?.id}`}
      />
    </div>
  )
}
