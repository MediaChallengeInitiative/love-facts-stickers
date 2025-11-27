'use client'

import { motion } from 'framer-motion'
import { Download, Sparkles, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface HeroProps {
  onBrowseClick: () => void
}

export function Hero({ onBrowseClick }: HeroProps) {
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
          <Button variant="outline" size="lg" className="w-full xs:w-auto">
            <Share2 className="mr-2" size={18} />
            Share the Pack
          </Button>
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
