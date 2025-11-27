'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Share2, Copy, MessageCircle, FolderDown, QrCode, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import type { Sticker } from '@/lib/types'

// Social media icons as SVG components
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </svg>
)

interface StickerPreviewModalProps {
  sticker: Sticker | null
  isOpen: boolean
  onClose: () => void
  onDownload: (sticker: Sticker, type: 'single' | 'collection') => void
}

export function StickerPreviewModal({
  sticker,
  isOpen,
  onClose,
  onDownload,
}: StickerPreviewModalProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  if (!sticker) return null

  const stickerUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/sticker/${sticker.id}`
  const shareText = sticker.caption || `Check out this media literacy sticker: ${sticker.title} from Love Facts!`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(stickerUrl)
    toast.success('Link copied to clipboard!')
    setShowShareMenu(false)
  }

  const handleShareWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${stickerUrl}`)}`
    window.open(whatsappUrl, '_blank')
    setShowShareMenu(false)
  }

  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(stickerUrl)}`
    window.open(twitterUrl, '_blank')
    setShowShareMenu(false)
  }

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(stickerUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(facebookUrl, '_blank')
    setShowShareMenu(false)
  }

  const handleShareInstagram = () => {
    // Instagram doesn't have a direct share URL, so we copy the link and notify user
    navigator.clipboard.writeText(stickerUrl)
    toast.success('Link copied! Open Instagram and paste in your story or post.')
    setShowShareMenu(false)
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById('sticker-qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `${sticker.title.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`
      downloadLink.href = pngFile
      downloadLink.click()
      toast.success('QR code downloaded!')
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col md:flex-row gap-4 xs:gap-6">
        {/* Image Preview */}
        <div className="flex-shrink-0 md:flex-1 min-h-[200px] xs:min-h-[250px] md:min-h-[300px] relative bg-slate-100 dark:bg-slate-900/50 rounded-lg xs:rounded-xl overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sticker.sourceUrl}
            alt={sticker.title}
            className="max-w-full max-h-[200px] xs:max-h-[250px] md:max-h-[400px] object-contain p-3 xs:p-4"
          />
        </div>

        {/* Details & Actions */}
        <div className="flex-1 flex flex-col min-w-0">
          <h2 className="text-lg xs:text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1 xs:mb-2 truncate">{sticker.title}</h2>

          <div className="flex items-center gap-2 mb-3 xs:mb-4">
            <Badge variant="info">{sticker.collection.name}</Badge>
          </div>

          {sticker.caption && (
            <div className="mb-3 xs:mb-4">
              <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400 mb-1">Suggested caption:</p>
              <p className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700/50 rounded-lg p-2 xs:p-3 text-xs xs:text-sm italic line-clamp-3 xs:line-clamp-none">
                &ldquo;{sticker.caption}&rdquo;
              </p>
            </div>
          )}

          {sticker.tags.length > 0 && (
            <div className="mb-4 xs:mb-6">
              <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400 mb-1.5 xs:mb-2">Tags:</p>
              <div className="flex flex-wrap gap-1.5 xs:gap-2">
                {sticker.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 xs:px-2 py-0.5 xs:py-1 text-[10px] xs:text-xs bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto space-y-2 xs:space-y-3">
            {/* Download Single */}
            <Button
              variant="primary"
              size="lg"
              className="w-full text-sm xs:text-base"
              onClick={() => onDownload(sticker, 'single')}
            >
              <Download className="mr-1.5 xs:mr-2" size={18} />
              Download PNG
            </Button>

            {/* Download Collection */}
            <Button
              variant="secondary"
              size="md"
              className="w-full text-xs xs:text-sm"
              onClick={() => onDownload(sticker, 'collection')}
            >
              <FolderDown className="mr-1.5 xs:mr-2" size={16} />
              Download Collection
            </Button>

            {/* Share and QR Buttons Row */}
            <div className="flex gap-2">
              {/* Share Button */}
              <div className="relative flex-1">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full text-xs xs:text-sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className="mr-1.5 xs:mr-2" size={16} />
                  Share
                </Button>

                {/* Share Menu */}
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-700 rounded-lg xs:rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden shadow-xl z-20"
                  >
                    <button
                      onClick={handleShareWhatsApp}
                      className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-left text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2.5 xs:gap-3 transition-colors text-sm"
                    >
                      <MessageCircle size={16} className="text-green-500" />
                      WhatsApp
                    </button>
                    <button
                      onClick={handleShareTwitter}
                      className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-left text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2.5 xs:gap-3 transition-colors border-t border-slate-200 dark:border-slate-600 text-sm"
                    >
                      <span className="text-slate-900 dark:text-white"><TwitterIcon /></span>
                      X (Twitter)
                    </button>
                    <button
                      onClick={handleShareFacebook}
                      className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-left text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2.5 xs:gap-3 transition-colors border-t border-slate-200 dark:border-slate-600 text-sm"
                    >
                      <span className="text-blue-500"><FacebookIcon /></span>
                      Facebook
                    </button>
                    <button
                      onClick={handleShareInstagram}
                      className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-left text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2.5 xs:gap-3 transition-colors border-t border-slate-200 dark:border-slate-600 text-sm"
                    >
                      <span className="text-pink-500"><InstagramIcon /></span>
                      Instagram
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="w-full px-3 xs:px-4 py-2.5 xs:py-3 text-left text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-2.5 xs:gap-3 transition-colors border-t border-slate-200 dark:border-slate-600 text-sm"
                    >
                      <Copy size={16} className="text-slate-400" />
                      Copy Link
                    </button>
                  </motion.div>
                )}
              </div>

              {/* QR Code Button - Hidden on very small screens */}
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowQRCode(!showQRCode)}
                className="px-2.5 xs:px-3 hidden xs:flex"
                title="Show QR Code"
              >
                <QrCode size={16} />
              </Button>
            </div>

            {/* QR Code Display */}
            {showQRCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg xs:rounded-xl p-3 xs:p-4 flex flex-col items-center"
              >
                <p className="text-slate-800 text-xs xs:text-sm font-medium mb-2 xs:mb-3">Scan to share this sticker</p>
                <QRCodeSVG
                  id="sticker-qr-code"
                  value={stickerUrl}
                  size={120}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#1e293b"
                />
                <p className="text-slate-500 text-[10px] xs:text-xs mt-2 text-center break-all max-w-[180px]">
                  {stickerUrl}
                </p>
                <button
                  onClick={handleDownloadQR}
                  className="mt-2 xs:mt-3 text-xs xs:text-sm text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1"
                >
                  <Download size={12} />
                  Download QR
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
