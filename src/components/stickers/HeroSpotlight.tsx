'use client'

// Hero Spotlight — the 10 stickers Silas wants to actively push this week.
// Horizontal snap-scroll on mobile, grid on desktop. Each card is a
// one-tap WhatsApp send + a save button. View impressions tracked via
// IntersectionObserver.

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, MessageCircle, Share2, Flame } from 'lucide-react'
import type { Sticker } from '@/lib/types'
import { downloadSticker } from '@/lib/download'
import { AddToWhatsAppButton } from '@/components/share/AddToWhatsAppButton'

interface Props {
  onShare: (sticker: Sticker) => void
  onPreview: (sticker: Sticker) => void
}

export function HeroSpotlight({ onShare, onPreview }: Props) {
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [isFallback, setIsFallback] = useState(false)
  const [loading, setLoading] = useState(true)
  const sectionRef = useRef<HTMLDivElement>(null)
  const observedIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/stickers/hero')
      .then((r) => r.json())
      .then((data) => {
        setStickers(data.stickers || [])
        setIsFallback(data.isFallback || false)
      })
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [])

  // Track view impressions for hero stickers — fire-and-forget per sticker.
  useEffect(() => {
    if (!sectionRef.current || stickers.length === 0) return
    const root = sectionRef.current

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const id = (entry.target as HTMLElement).dataset.stickerId
          if (!id || observedIds.current.has(id)) continue
          observedIds.current.add(id)
          fetch(`/api/sticker/${id}/share-track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel: 'view-hero' }),
          }).catch(() => undefined)
        }
      },
      { root: null, threshold: 0.5 }
    )

    root.querySelectorAll<HTMLElement>('[data-sticker-id]').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [stickers])

  if (loading) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8" aria-busy="true">
        <div className="h-7 w-64 bg-lovefacts-turquoise/20 rounded animate-pulse mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 h-80 bg-lovefacts-turquoise/10 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      </section>
    )
  }

  if (stickers.length === 0) return null

  return (
    <section
      ref={sectionRef}
      id="hero-spotlight"
      className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-10 pb-6"
      aria-labelledby="spotlight-heading"
    >
      <div className="flex items-end justify-between mb-4 sm:mb-6 gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 bg-lovefacts-coral text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Flame size={12} />
            {isFallback ? 'Most-shared right now' : "This week's truth bombs"}
          </div>
          <h2 id="spotlight-heading" className="text-2xl sm:text-3xl font-extrabold text-lovefacts-teal dark:text-white">
            Stickers worth firing first
          </h2>
        </div>
        {stickers.length >= 3 && (
          <AddToWhatsAppButton
            target={{ kind: 'heroes', packName: 'Love Facts — Top picks' }}
            label="Add to WhatsApp"
            size="sm"
            className="shrink-0 hidden sm:inline-flex"
          />
        )}
      </div>

      <div
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {stickers.map((sticker, i) => (
          <motion.article
            key={sticker.id}
            data-sticker-id={sticker.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 w-[260px] sm:w-[280px] snap-start bg-white dark:bg-lovefacts-teal rounded-3xl border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-lovefacts-coral/15 transition-shadow"
          >
            <button
              onClick={() => onPreview(sticker)}
              className="block w-full relative aspect-square bg-gradient-to-br from-lovefacts-turquoise/5 to-lovefacts-coral/5 dark:from-lovefacts-teal-dark dark:to-lovefacts-teal"
              aria-label={`Preview ${sticker.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sticker.thumbnailUrl}
                alt={sticker.title}
                loading="lazy"
                className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] object-contain"
              />
              {!!sticker.shareCount && sticker.shareCount > 0 && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 bg-lovefacts-coral text-white rounded-full text-[10px] font-bold">
                  <Share2 size={10} />
                  {sticker.shareCount}
                </span>
              )}
            </button>
            <div className="p-3 sm:p-4">
              <h3 className="text-sm font-bold text-lovefacts-teal dark:text-white line-clamp-1 mb-1">
                {sticker.title}
              </h3>
              {sticker.collection?.name && (
                <p className="text-[10px] text-lovefacts-teal/50 dark:text-lovefacts-turquoise/50 mb-2.5 uppercase tracking-wide">
                  {sticker.collection.name}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => onShare(sticker)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-lovefacts-green hover:bg-lovefacts-green-dark text-white rounded-xl font-semibold text-xs transition-colors"
                >
                  <MessageCircle size={14} />
                  Send
                </button>
                <button
                  onClick={() => downloadSticker(sticker, { downloadType: 'single', channel: 'hero-spotlight' })}
                  className="inline-flex items-center justify-center w-9 h-9 bg-lovefacts-coral/10 hover:bg-lovefacts-coral/20 text-lovefacts-coral rounded-xl transition-colors"
                  aria-label={`Save ${sticker.title}`}
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
