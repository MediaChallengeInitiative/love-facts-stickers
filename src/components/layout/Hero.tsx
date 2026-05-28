'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Sparkles, MessageCircle, Send, Music2, Facebook as FacebookLogo, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ShareSheet } from '@/components/share/ShareSheet'
import { AddToWhatsAppButton } from '@/components/share/AddToWhatsAppButton'
import { getBaseUrl } from '@/lib/urls'

interface HeroProps {
  onBrowseClick: () => void
}

// X (Twitter) currentColor logo
const XLogo = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const PLATFORMS = [
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle size={14} />, color: '#25D366' },
  { id: 'tiktok', label: 'TikTok', icon: <Music2 size={14} />, color: '#000000' },
  { id: 'telegram', label: 'Telegram', icon: <Send size={14} />, color: '#229ED9' },
  { id: 'x', label: 'X', icon: <XLogo size={14} />, color: '#000000' },
  { id: 'facebook', label: 'Facebook', icon: <FacebookLogo size={14} />, color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: <Instagram size={14} />, color: '#E1306C' },
]

export function Hero({ onBrowseClick }: HeroProps) {
  const [shareOpen, setShareOpen] = useState(false)

  const siteUrl = getBaseUrl()

  return (
    <section
      className="relative min-h-[100svh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden pt-16 pb-8 sm:pt-0 sm:pb-0"
      aria-label="Love Facts Stickers introduction"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white via-lovefacts-turquoise/5 to-lovefacts-coral/5 dark:from-lovefacts-teal-dark dark:via-lovefacts-teal dark:to-lovefacts-teal-dark transition-colors duration-300" />

      <div className="absolute inset-0 overflow-hidden motion-reduce:hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full bg-lovefacts-turquoise/5 dark:bg-lovefacts-turquoise/10 blur-3xl"
            initial={{ x: Math.random() * 100 - 50 + '%', y: Math.random() * 100 - 50 + '%' }}
            animate={{
              x: [Math.random() * 100 - 50 + '%', Math.random() * 100 - 50 + '%', Math.random() * 100 - 50 + '%'],
              y: [Math.random() * 100 - 50 + '%', Math.random() * 100 - 50 + '%', Math.random() * 100 - 50 + '%'],
            }}
            transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, repeatType: 'reverse' }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-1.5 xs:py-2 mb-4 xs:mb-6 bg-lovefacts-coral/10 border border-lovefacts-coral/30 rounded-full"
        >
          <Sparkles className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-lovefacts-coral" />
          <span className="text-xs xs:text-sm font-semibold text-lovefacts-coral">
            Free. Anonymous. No signup.
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-fluid-h1 font-extrabold tracking-tight text-lovefacts-teal dark:text-white mb-3 xs:mb-4 text-balance"
        >
          Clap back at lies.
          <span className="block bg-gradient-to-r from-lovefacts-coral via-lovefacts-turquoise to-lovefacts-green bg-clip-text text-transparent">
            In one tap.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-base xs:text-lg sm:text-xl text-lovefacts-teal-light dark:text-lovefacts-turquoise-light mb-5 xs:mb-7 max-w-2xl mx-auto leading-relaxed px-2"
        >
          Free media literacy stickers for every Ugandan group chat. Save, send, and call out misinformation — wherever
          the conversation is happening.
        </motion.p>

        {/* Platform strip — names the actual apps this works on */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-1.5 xs:gap-2 mb-6 xs:mb-8"
          aria-label="Supported platforms"
        >
          <span className="text-[10px] xs:text-xs uppercase tracking-wider text-lovefacts-teal/50 dark:text-lovefacts-turquoise/50 mr-1">
            Works on
          </span>
          {PLATFORMS.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] xs:text-xs font-medium text-white"
              style={{ backgroundColor: p.color }}
            >
              {p.icon}
              {p.label}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center justify-center gap-3 px-4"
        >
          <AddToWhatsAppButton
            target={{ kind: 'heroes', packName: 'Love Facts — Top picks' }}
            label="Get the WhatsApp Pack →"
            size="lg"
            className="w-full xs:w-auto text-base px-7 py-3.5"
          />
          <div className="flex flex-col xs:flex-row items-center justify-center gap-3 w-full xs:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={onBrowseClick}
              className="w-full xs:w-auto border-lovefacts-coral text-lovefacts-coral hover:bg-lovefacts-coral/10"
            >
              <Download className="mr-2" size={16} />
              Browse all stickers
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="w-full xs:w-auto text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 hover:text-lovefacts-teal dark:hover:text-white"
              onClick={() => setShareOpen(true)}
            >
              <MessageCircle className="mr-2" size={16} />
              Send to a friend
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-10 xs:mt-14 flex flex-wrap items-center justify-center gap-4 xs:gap-8"
        >
          <div className="text-center min-w-[80px]">
            <p className="text-2xl xs:text-3xl font-bold text-lovefacts-teal dark:text-white">200+</p>
            <p className="text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70">Stickers</p>
          </div>
          <div className="w-px h-10 xs:h-12 bg-lovefacts-turquoise/30 hidden xs:block" />
          <div className="text-center min-w-[80px]">
            <p className="text-2xl xs:text-3xl font-bold text-lovefacts-teal dark:text-white">5</p>
            <p className="text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70">Collections</p>
          </div>
          <div className="w-px h-10 xs:h-12 bg-lovefacts-turquoise/30 hidden xs:block" />
          <div className="text-center min-w-[80px]">
            <p className="text-2xl xs:text-3xl font-bold text-lovefacts-teal dark:text-white">0</p>
            <p className="text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70">Forms to fill</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-4 xs:bottom-8 left-1/2 -translate-x-1/2 hidden xs:block motion-reduce:hidden"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-lovefacts-turquoise/50 rounded-full flex justify-center"
        >
          <motion.div className="w-1.5 h-3 bg-lovefacts-turquoise rounded-full mt-2" />
        </motion.div>
      </motion.div>

      {/* The "Send to a friend" button shares the whole site, not a sticker */}
      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        subject={{
          id: 'homepage',
          title: 'Love Facts Stickers',
          url: siteUrl,
          caption: 'Free media literacy stickers from Media Challenge Initiative — clap back at lies in one tap.',
        }}
      />
    </section>
  )
}
