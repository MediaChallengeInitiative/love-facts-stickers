'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Home, FolderDown, ChevronRight, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ShareSheet } from '@/components/share/ShareSheet'
import type { Sticker, Collection } from '@/lib/types'
import { downloadSticker } from '@/lib/download'

interface StickerSharePageProps {
  sticker: Sticker & { collection: Collection }
}

export default function StickerSharePage({ sticker }: StickerSharePageProps) {
  const [shareOpen, setShareOpen] = useState(false)

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/sticker/${sticker.id}`
      : `https://stickers.lovefacts.africa/sticker/${sticker.id}`

  const handleDownload = async (type: 'single' | 'collection' = 'single') => {
    await downloadSticker(sticker, { downloadType: type, channel: 'detail-page' })
  }

  return (
    <div className="min-h-screen bg-lovefacts-turquoise-light dark:bg-lovefacts-teal-dark">
      <header className="bg-white dark:bg-lovefacts-teal shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-lovefacts-teal dark:text-white hover:text-lovefacts-coral dark:hover:text-lovefacts-coral transition-colors"
            >
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

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-lovefacts-teal rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="md:flex">
              <div className="md:w-1/2 bg-gradient-to-br from-lovefacts-turquoise/5 to-lovefacts-turquoise/10 dark:from-lovefacts-teal-dark/50 dark:to-lovefacts-teal-dark p-8 md:p-12 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sticker.sourceUrl}
                  alt={sticker.title}
                  className="max-w-full max-h-[400px] object-contain drop-shadow-xl"
                />
              </div>

              <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
                <div>
                  <Badge variant="info" className="mb-3">
                    {sticker.collection.name}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-bold text-lovefacts-teal dark:text-white mb-4">
                    {sticker.title}
                  </h1>

                  {sticker.caption && (
                    <div className="mb-6">
                      <p className="text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 mb-2">
                        Suggested caption:
                      </p>
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
                  <Button variant="primary" size="lg" className="w-full" onClick={() => handleDownload('single')}>
                    <Download className="mr-2" size={20} />
                    Save Sticker
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full bg-lovefacts-green hover:bg-lovefacts-green-dark text-white"
                    onClick={() => setShareOpen(true)}
                  >
                    <Share2 className="mr-2" size={18} />
                    Share to any app
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    className="w-full"
                    onClick={() => handleDownload('collection')}
                  >
                    <FolderDown className="mr-2" size={18} />
                    Save Whole Collection
                  </Button>

                  <p className="text-[11px] text-center text-lovefacts-teal/50 dark:text-lovefacts-turquoise/50 pt-1">
                    WhatsApp · Telegram · TikTok · Facebook · Instagram · X · SMS · and more
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

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

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        subject={{
          id: sticker.id,
          title: sticker.title,
          url: shareUrl,
          caption: sticker.caption,
          imageUrl: sticker.sourceUrl,
        }}
      />
    </div>
  )
}
