'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Hero } from '@/components/layout/Hero'
import { StickerGrid } from '@/components/stickers/StickerGrid'
import { FilterBar } from '@/components/stickers/FilterBar'
import { StackedGallery } from '@/components/StickerCollections/StackedGallery'
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
        fetch('/api/stickers?limit=500'), // Fetch all stickers
      ])

      if (collectionsRes.ok) {
        const collectionsData = await collectionsRes.json()
        // Handle both array and object responses
        const collectionsArray = Array.isArray(collectionsData)
          ? collectionsData
          : collectionsData.collections || []
        setCollections(collectionsArray)
      }

      if (stickersRes.ok) {
        const stickersData = await stickersRes.json()
        // Handle both array and object responses
        const stickersArray = Array.isArray(stickersData)
          ? stickersData
          : stickersData.stickers || []
        setStickers(stickersArray)
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
      // Check both collectionId and collection.id for compatibility
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero onBrowseClick={handleBrowseClick} />

      {/* Collections Section - 3D Stacked Gallery */}
      <section id="collections" className="py-10 xs:py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" aria-labelledby="stickers-heading">
        <div className="text-center mb-8 xs:mb-10 sm:mb-12">
          <h2 id="stickers-heading" className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white mb-3 xs:mb-4">Sticker Collections</h2>
          <p className="text-sm xs:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto px-2">
            Browse our curated collections of media literacy stickers. Each collection has a unique theme
            to help you fight misinformation in different ways.
          </p>
        </div>

        {isLoading ? (
          // Loading skeleton for 3D gallery
          <div className="flex items-center justify-center py-16">
            <div className="w-[280px] h-[380px] bg-slate-200 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
          </div>
        ) : (
          <StackedGallery
            stickers={stickers.slice(0, 20).map((s) => ({
              id: s.id,
              title: s.title,
              imageUrl: s.thumbnailUrl,
              collectionId: s.collectionId,
              collectionName: s.collection?.name,
            }))}
            onView={(id) => {
              const sticker = stickers.find((s) => s.id === id)
              if (sticker) {
                setSelectedSticker(sticker)
                setShowPreviewModal(true)
              }
            }}
            onDownload={(id) => {
              fetch('/api/download-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stickerId: id, isAnonymous: true, downloadType: 'single' }),
              }).catch(console.error)
            }}
            maxVisible={5}
          />
        )}
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
