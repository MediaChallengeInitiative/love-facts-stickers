'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Sparkles, Share2, MessageCircle, Copy, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

// Social media icons
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

interface HeroProps {
  onBrowseClick: () => void
}

export function Hero({ onBrowseClick }: HeroProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://stickers.lovefacts.africa'
  const shareText = "Check out Love Facts Stickers! Free media literacy stickers to fight misinformation. Download and share to make the truth go viral! 🎯"

  const handleShare = async () => {
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Love Facts Stickers',
          text: shareText,
          url: siteUrl,
        })
        return
      } catch (err) {
        // User cancelled or error, fall back to menu
        if ((err as Error).name !== 'AbortError') {
          setShowShareMenu(true)
        }
        return
      }
    }
    // Show share menu on desktop
    setShowShareMenu(true)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
      setShowShareMenu(false)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${siteUrl}`)}`, '_blank')
    setShowShareMenu(false)
  }

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}`, '_blank')
    setShowShareMenu(false)
  }

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank')
    setShowShareMenu(false)
  }

  return (
    <section className="relative min-h-[100svh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden pt-16 pb-8 sm:pt-0 sm:pb-0">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-pink-50/50 to-slate-100 dark:from-slate-900 dark:via-pink-900/20 dark:to-slate-900 transition-colors duration-300" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full bg-pink-500/5 dark:bg-pink-500/10 blur-3xl"
            initial={{
              x: Math.random() * 100 - 50 + '%',
              y: Math.random() * 100 - 50 + '%',
            }}
            animate={{
              x: [
                Math.random() * 100 - 50 + '%',
                Math.random() * 100 - 50 + '%',
                Math.random() * 100 - 50 + '%',
              ],
              y: [
                Math.random() * 100 - 50 + '%',
                Math.random() * 100 - 50 + '%',
                Math.random() * 100 - 50 + '%',
              ],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1.5 xs:py-2 mb-4 xs:mb-6 bg-pink-500/10 dark:bg-pink-500/20 border border-pink-500/20 dark:border-pink-500/30 rounded-full"
        >
          <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-pink-500 dark:text-pink-400" />
          <span className="text-xs xs:text-sm font-medium text-pink-600 dark:text-pink-300">
            Free Media Literacy Stickers
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4 xs:mb-6 leading-tight"
        >
          Fight Misinformation with
          <span className="block bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 bg-clip-text text-transparent">
            Love Facts Stickers
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-base xs:text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-6 xs:mb-8 max-w-2xl mx-auto leading-relaxed px-2"
        >
          Download free stickers to call out lies, kickstart conversations, and make the truth go viral.
          Perfect for WhatsApp, social media, and everyday messaging!
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col xs:flex-row items-center justify-center gap-3 xs:gap-4 px-4"
        >
          <Button size="lg" onClick={onBrowseClick} className="w-full xs:w-auto">
            <Download className="mr-2" size={18} />
            Browse Stickers
          </Button>
          <div className="relative w-full xs:w-auto">
            <Button variant="outline" size="lg" className="w-full xs:w-auto" onClick={handleShare}>
              <Share2 className="mr-2" size={18} />
              Share the Pack
            </Button>

            {/* Share Menu Dropdown */}
            <AnimatePresence>
              {showShareMenu && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowShareMenu(false)}
                  />

                  {/* Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 z-50 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden"
                  >
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Share via
                      </p>
                      <button
                        onClick={handleShareWhatsApp}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <MessageCircle size={18} className="text-green-500" />
                        <span className="font-medium">WhatsApp</span>
                      </button>
                      <button
                        onClick={handleShareTwitter}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <span className="text-slate-900 dark:text-white"><TwitterIcon /></span>
                        <span className="font-medium">X (Twitter)</span>
                      </button>
                      <button
                        onClick={handleShareFacebook}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <span className="text-blue-600"><FacebookIcon /></span>
                        <span className="font-medium">Facebook</span>
                      </button>
                      <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />
                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {copied ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-slate-400" />
                        )}
                        <span className="font-medium">{copied ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setShowShareMenu(false)}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 xs:mt-12 flex flex-wrap items-center justify-center gap-4 xs:gap-8"
        >
          <div className="text-center min-w-[80px]">
            <p className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white">200+</p>
            <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400">Unique Stickers</p>
          </div>
          <div className="w-px h-10 xs:h-12 bg-slate-300 dark:bg-slate-700 hidden xs:block" />
          <div className="text-center min-w-[80px]">
            <p className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white">5</p>
            <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400">Collections</p>
          </div>
          <div className="w-px h-10 xs:h-12 bg-slate-300 dark:bg-slate-700 hidden xs:block" />
          <div className="text-center min-w-[80px]">
            <p className="text-2xl xs:text-3xl font-bold text-slate-900 dark:text-white">100%</p>
            <p className="text-xs xs:text-sm text-slate-500 dark:text-slate-400">Free to Use</p>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Hidden on very small screens */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 xs:bottom-8 left-1/2 -translate-x-1/2 hidden xs:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-slate-400 dark:border-slate-600 rounded-full flex justify-center"
        >
          <motion.div className="w-1.5 h-3 bg-slate-500 dark:bg-slate-400 rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  )
}
