'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Home, FolderDown, Share2, Copy, MessageCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DownloadGatingModal } from '@/components/modals/DownloadGatingModal'
import { DownloadSuccessModal } from '@/components/modals/DownloadSuccessModal'
import toast from 'react-hot-toast'
import type { Sticker, Collection } from '@/lib/types'

interface StickerSharePageProps {
  sticker: Sticker & { collection: Collection }
}

export default function StickerSharePage({ sticker }: StickerSharePageProps) {
  const [showDownloadGating, setShowDownloadGating] = useState(false)
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false)
  const [downloadType, setDownloadType] = useState<'single' | 'collection'>('single')

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/sticker/${sticker.id}`
    : `https://lovefactsstickers.org/sticker/${sticker.id}`

  const shareText = sticker.caption || `Check out this media literacy sticker: ${sticker.title} from Love Facts!`

  const handleDownload = async (type: 'single' | 'collection') => {
    setDownloadType(type)
    setShowDownloadGating(true)
  }

  const handleDownloadSubmit = async (data: { email?: string; phone?: string; name?: string; isAnonymous: boolean }) => {
    // Handle the download request
    try {
      const response = await fetch('/api/download-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stickerId: sticker.id,
          downloadType,
          ...data
        })
      })

      if (response.ok) {
        setShowDownloadGating(false)
        setShowDownloadSuccess(true)
      } else {
        throw new Error('Download request failed')
      }
    } catch (error) {
      console.error('Download error:', error)
      // Handle error state here
    }
  }

  const handleShare = (platform: string) => {
    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied to clipboard!')
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank')
        break
    }
  }

  return (
    <div className="min-h-screen bg-lovefacts-turquoise-light dark:bg-lovefacts-teal-dark">
      {/* Header */}
      <header className="bg-white dark:bg-lovefacts-teal shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-lovefacts-teal dark:text-white hover:text-lovefacts-coral dark:hover:text-lovefacts-coral transition-colors">
              <Home size={20} />
              <span className="font-semibold">Love Facts Stickers</span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60">
              <Link href="/" className="hover:text-lovefacts-coral dark:hover:text-lovefacts-coral transition-colors">
                Home
              </Link>
              <ChevronRight size={16} />
              <span>{sticker.collection.name}</span>
              <ChevronRight size={16} />
              <span className="text-lovefacts-teal dark:text-white">{sticker.title}</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-lovefacts-teal rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="md:flex">
              {/* Sticker Image */}
              <div className="md:w-1/2 bg-gradient-to-br from-lovefacts-turquoise/5 to-lovefacts-turquoise/10 dark:from-lovefacts-teal-dark/50 dark:to-lovefacts-teal-dark p-8 md:p-12 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sticker.sourceUrl}
                  alt={sticker.title}
                  className="max-w-full max-h-[400px] object-contain drop-shadow-xl"
                />
              </div>

              {/* Details & Actions */}
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                <div>
                  <Badge variant="info" className="mb-3">{sticker.collection.name}</Badge>
                  <h1 className="text-2xl md:text-3xl font-bold text-lovefacts-teal dark:text-white mb-4">
                    {sticker.title}
                  </h1>

                  {sticker.caption && (
                    <div className="mb-6">
                      <p className="text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 mb-2">Suggested caption:</p>
                      <p className="text-lovefacts-teal dark:text-white bg-lovefacts-turquoise/5 dark:bg-lovefacts-turquoise/10 rounded-lg p-3 italic">
                        &ldquo;{sticker.caption}&rdquo;
                      </p>
                    </div>
                  )}

                  {sticker.tags.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {sticker.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 text-lovefacts-teal dark:text-lovefacts-turquoise-light rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto space-y-3">
                  {/* Download Buttons */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => handleDownload('single')}
                  >
                    <Download className="mr-2" size={20} />
                    Download Sticker
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={() => handleDownload('collection')}
                  >
                    <FolderDown className="mr-2" size={18} />
                    Download Entire Collection
                  </Button>

                  {/* Share Options */}
                  <div className="pt-3 border-t border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30">
                    <p className="text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 mb-3">Share this sticker:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-lovefacts-green/10 hover:bg-lovefacts-green/20 text-lovefacts-green rounded-lg transition-colors text-sm font-medium"
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-lovefacts-turquoise/10 hover:bg-lovefacts-turquoise/20 text-lovefacts-teal dark:text-lovefacts-turquoise rounded-lg transition-colors text-sm font-medium"
                      >
                        <Share2 size={16} />
                        X (Twitter)
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1877f2]/10 hover:bg-[#1877f2]/20 text-[#1877f2] rounded-lg transition-colors text-sm font-medium"
                      >
                        <Share2 size={16} />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-lovefacts-teal/10 dark:bg-lovefacts-turquoise/10 hover:bg-lovefacts-teal/20 dark:hover:bg-lovefacts-turquoise/20 text-lovefacts-teal dark:text-lovefacts-turquoise rounded-lg transition-colors text-sm font-medium"
                      >
                        <Copy size={16} />
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* More from this collection */}
          <div className="mt-8 text-center">
            <Link 
              href={`/?collection=${sticker.collection.slug}`}
              className="inline-flex items-center gap-2 text-lovefacts-teal dark:text-lovefacts-turquoise hover:text-lovefacts-coral dark:hover:text-lovefacts-coral transition-colors font-medium"
            >
              View more from {sticker.collection.name}
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </main>

      {/* Modals */}
      <DownloadGatingModal
        isOpen={showDownloadGating}
        onClose={() => setShowDownloadGating(false)}
        onSubmit={handleDownloadSubmit}
        downloadType={downloadType}
        itemName={sticker.title}
      />

      <DownloadSuccessModal
        isOpen={showDownloadSuccess}
        onClose={() => setShowDownloadSuccess(false)}
        stickerName={sticker.title}
        shareUrl={shareUrl}
      />
    </div>
  )
}