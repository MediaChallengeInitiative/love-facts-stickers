'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, MessageCircle, Copy, QrCode } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface DownloadSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  stickerName: string
  shareUrl: string
}

export function DownloadSuccessModal({
  isOpen,
  onClose,
  stickerName,
  shareUrl,
}: DownloadSuccessModalProps) {
  const [showQR, setShowQR] = useState(false)

  const handleShareWhatsApp = () => {
    const text = `Check out this sticker: ${stickerName}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    toast.success('Link copied to clipboard!')
  }

  // Auto close after some time
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, 30000) // 30 seconds
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-4">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-500" />
        </motion.div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Download Started!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Your sticker is downloading. Spread the word and share with friends!
        </p>

        {/* Share Options */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleShareWhatsApp}
          >
            <MessageCircle className="mr-2" size={20} />
            Share on WhatsApp
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={handleCopyLink}
            >
              <Copy className="mr-2" size={16} />
              Copy Link
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode size={20} />
            </Button>
          </div>
        </div>

        {/* QR Code (simplified placeholder - would use a QR library in production) */}
        {showQR && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-slate-100 dark:bg-white rounded-xl inline-block"
          >
            <div className="w-32 h-32 bg-slate-200 rounded flex items-center justify-center text-slate-500 text-xs">
              QR Code
              <br />
              (Use qrcode.react)
            </div>
          </motion.div>
        )}

        <p className="text-xs text-slate-500 mt-6">
          Thank you for spreading media literacy!
        </p>
      </div>
    </Modal>
  )
}
