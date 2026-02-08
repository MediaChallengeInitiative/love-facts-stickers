'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, RefreshCw, Sparkles } from 'lucide-react'

interface StickerModalProps {
  isOpen: boolean
  onClose: () => void
  sticker: {
    id: string
    title: string
    imageUrl: string
  } | null
  onDownload?: (id: string) => void
}

export function StickerModal({ isOpen, onClose, sticker, onDownload }: StickerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const retryCount = useRef(0)

  // Reset image state when sticker changes
  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
    retryCount.current = 0
  }, [sticker?.id])

  const handleImageError = useCallback(() => {
    if (retryCount.current < 3 && sticker) {
      retryCount.current++
      setTimeout(() => {
        if (imgRef.current) {
          const url = sticker.imageUrl
          const separator = url.includes('?') ? '&' : '?'
          imgRef.current.src = `${url}${separator}_t=${Date.now()}`
        }
      }, 1500 * retryCount.current)
    } else {
      setImageError(true)
    }
  }, [sticker])

  const handleManualRetry = useCallback(() => {
    if (!sticker) return
    retryCount.current = 0
    setImageError(false)
    setImageLoaded(false)
    if (imgRef.current) {
      const separator = sticker.imageUrl.includes('?') ? '&' : '?'
      imgRef.current.src = `${sticker.imageUrl}${separator}_t=${Date.now()}`
    }
  }, [sticker])

  // Focus trap and ESC key handling
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      closeButtonRef.current?.focus()

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }

        // Focus trap
        if (e.key === 'Tab' && modalRef.current) {
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
        previousActiveElement.current?.focus()
      }
    }
  }, [isOpen, onClose])

  const handleDownload = useCallback(async () => {
    if (!sticker) return

    // Track download
    if (onDownload) {
      onDownload(sticker.id)
    } else {
      try {
        await fetch('/api/stickers/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: sticker.id }),
        })
      } catch (error) {
        console.error('Failed to track download:', error)
      }
    }

    // Trigger download via blob for reliable saving
    try {
      const imageRes = await fetch(sticker.imageUrl)
      const blob = await imageRes.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${sticker.title.replace(/\s+/g, '-').toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(sticker.imageUrl, '_blank')
    }
  }, [sticker, onDownload])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!sticker) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label={`Preview of ${sticker.title} sticker`}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-3xl bg-white dark:bg-lovefacts-teal rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-lovefacts-teal-light/90 backdrop-blur-sm rounded-full text-lovefacts-teal dark:text-lovefacts-turquoise-light hover:bg-lovefacts-turquoise/10 dark:hover:bg-lovefacts-turquoise/20 transition-colors shadow-lg"
              aria-label="Close preview"
            >
              <X size={20} />
            </button>

            {/* Image container */}
            <div className="relative aspect-square sm:aspect-video bg-gradient-to-br from-white to-lovefacts-turquoise/5 dark:from-lovefacts-teal-dark dark:to-lovefacts-teal flex items-center justify-center p-8">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-20">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                    backgroundSize: '20px 20px',
                  }}
                />
              </div>

              {/* Loading state */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-lovefacts-turquoise/10 animate-pulse flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-lovefacts-turquoise/40 animate-spin" />
                  </div>
                </div>
              )}

              {/* Error state */}
              {imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Sparkles className="w-10 h-10 text-lovefacts-turquoise/40" />
                  <p className="text-sm text-lovefacts-teal/50 dark:text-lovefacts-turquoise/50">Image could not be loaded</p>
                  <button
                    onClick={handleManualRetry}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-lovefacts-turquoise/20 hover:bg-lovefacts-turquoise/30 rounded-full text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 transition-colors"
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                </div>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={sticker.imageUrl}
                alt={sticker.title}
                className={`relative max-w-full max-h-full object-contain drop-shadow-2xl transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-lovefacts-teal dark:text-white">
                    {sticker.title}
                  </h3>
                  <p className="text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 mt-1">
                    Click download to save this sticker
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-lovefacts-coral to-lovefacts-coral-dark hover:from-lovefacts-coral-dark hover:to-lovefacts-coral text-white font-medium rounded-xl shadow-lg shadow-lovefacts-coral/25 hover:shadow-xl hover:shadow-lovefacts-coral/30 transition-all"
                  aria-label={`Download ${sticker.title} sticker`}
                >
                  <Download size={18} />
                  <span>Download Sticker</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
