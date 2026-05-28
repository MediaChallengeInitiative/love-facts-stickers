'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Home, FolderDown, Share2, Copy, MessageCircle, ChevronRight, Send, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import type { Sticker, Collection } from '@/lib/types'
import { downloadSticker } from '@/lib/download'

interface StickerSharePageProps {
  sticker: Sticker & { collection: Collection }
}

export default function StickerSharePage({ sticker }: StickerSharePageProps) {
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/sticker/${sticker.id}`
      : `https://stickers.lovefacts.africa/sticker/${sticker.id}`

  const shareText = sticker.caption || `Check out this media literacy sticker: ${sticker.title} — from Love Facts`

  const handleDownload = async (type: 'single' | 'collection' = 'single') => {
    await downloadSticker(sticker, { downloadType: type, channel: 'detail-page' })
  }

  const trackShare = (channel: string) => {
    fetch(`/api/sticker/${sticker.id}/share-track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel }),
    }).catch(() => undefined)
    try {
      sessionStorage.setItem('lf:engaged', '1')
      window.dispatchEvent(new CustomEvent('lf:engaged'))
    } catch {
      /* ignore */
    }
  }

  const handleShare = async (platform: string) => {
    trackShare(platform)
    const encodedText = encodeURIComponent(`${shareText}\n${shareUrl}`)
    const encodedUrlOnly = encodeURIComponent(shareUrl)
    const encodedTextOnly = encodeURIComponent(shareText)

    switch (platform) {
      case 'native':
        if (typeof navigator !== 'undefined' && (navigator as Navigator).share) {
          try {
            await (navigator as Navigator).share({ title: sticker.title, text: shareText, url: shareUrl })
          } catch {
            /* user dismissed */
          }
        }
        break
      case 'copy':
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        toast.success('Caption + link copied — paste anywhere')
        break
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}`, '_blank', 'noopener,noreferrer')
        break
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodedUrlOnly}&text=${encodedTextOnly}`, '_blank', 'noopener,noreferrer')
        break
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedTextOnly}&url=${encodedUrlOnly}`,
          '_blank',
          'noopener,noreferrer'
        )
        break
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrlOnly}&quote=${encodedTextOnly}`,
          '_blank',
          'noopener,noreferrer'
        )
        break
      case 'sms':
        window.location.href = `sms:?&body=${encodedText}`
        break
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent('A Love Facts sticker for you')}&body=${encodedText}`
        break
    }
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
                    className="w-full"
                    onClick={() => handleShare('whatsapp')}
                  >
                    <MessageCircle className="mr-2" size={18} />
                    Send on WhatsApp
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

                  <div className="pt-3 border-t border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30">
                    <p className="text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 mb-3">
                      Or share it on:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleShare('telegram')}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] rounded-lg transition-colors text-xs font-medium"
                      >
                        <Send size={16} />
                        Telegram
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-lovefacts-turquoise/10 hover:bg-lovefacts-turquoise/20 text-lovefacts-teal dark:text-lovefacts-turquoise rounded-lg transition-colors text-xs font-medium"
                      >
                        <Share2 size={16} />X
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-[#1877f2]/10 hover:bg-[#1877f2]/20 text-[#1877f2] rounded-lg transition-colors text-xs font-medium"
                      >
                        <Share2 size={16} />
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('sms')}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-lovefacts-green/10 hover:bg-lovefacts-green/20 text-lovefacts-green-dark dark:text-lovefacts-green-light rounded-lg transition-colors text-xs font-medium"
                      >
                        <MessageCircle size={16} />
                        SMS
                      </button>
                      <button
                        onClick={() => handleShare('email')}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-lovefacts-teal/10 dark:bg-lovefacts-turquoise/10 hover:bg-lovefacts-teal/20 dark:hover:bg-lovefacts-turquoise/20 text-lovefacts-teal dark:text-lovefacts-turquoise rounded-lg transition-colors text-xs font-medium"
                      >
                        <Mail size={16} />
                        Email
                      </button>
                      <button
                        onClick={() => handleShare('copy')}
                        className="flex flex-col items-center justify-center gap-1 px-2 py-2 bg-lovefacts-coral/10 hover:bg-lovefacts-coral/20 text-lovefacts-coral rounded-lg transition-colors text-xs font-medium"
                      >
                        <Copy size={16} />
                        Copy
                      </button>
                    </div>
                  </div>
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
    </div>
  )
}
