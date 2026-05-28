'use client'

// Optional, post-action feedback. Never appears on first load.
// Only surfaces after the user has actually downloaded or shared a sticker
// (sessionStorage flag 'lf:engaged'), so we ask for input from people who
// have something useful to say — not from drive-by visitors.

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquarePlus, X, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import toast from 'react-hot-toast'

type Sentiment = 'positive' | 'neutral' | 'negative'

const DISMISS_KEY = 'lf:feedback:dismissed'
const SHOWN_KEY = 'lf:feedback:shown-at'

function hasEngaged(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem('lf:engaged') === '1'
  } catch {
    return false
  }
}

function recentlyDismissed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const ts = localStorage.getItem(DISMISS_KEY)
    if (!ts) return false
    const ms = Date.now() - Number(ts)
    return ms < 1000 * 60 * 60 * 24 * 7 // 7 days
  } catch {
    return false
  }
}

export function FeedbackPill() {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [sentiment, setSentiment] = useState<Sentiment | null>(null)
  const [missing, setMissing] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (recentlyDismissed()) return

    const maybeShow = () => {
      if (hasEngaged()) {
        setVisible(true)
        try {
          sessionStorage.setItem(SHOWN_KEY, String(Date.now()))
        } catch {
          /* ignore */
        }
      }
    }

    // Already engaged when mounted (e.g. user came back to root after share)?
    maybeShow()

    const handler = () => {
      // Give the post-share toast time to settle before nudging.
      setTimeout(maybeShow, 4000)
    }
    window.addEventListener('lf:engaged', handler)
    return () => window.removeEventListener('lf:engaged', handler)
  }, [])

  const dismiss = () => {
    setVisible(false)
    setOpen(false)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
  }

  const submit = async () => {
    if (!sentiment && !missing.trim()) {
      dismiss()
      return
    }
    setSubmitting(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentiment, missing: missing.trim() || undefined }),
      })
      toast.success('Thanks — we hear you')
    } catch {
      /* swallow */
    } finally {
      setSubmitting(false)
      dismiss()
    }
  }

  if (!visible) return null

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="panel"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed right-4 z-40 w-[min(360px,calc(100vw-2rem))] bg-white dark:bg-lovefacts-teal rounded-2xl shadow-2xl border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 p-4"
          style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          role="dialog"
          aria-label="Quick feedback"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-lovefacts-teal dark:text-white">Did this sticker land?</h3>
              <p className="text-[11px] text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60 mt-0.5">
                One tap, totally anonymous.
              </p>
            </div>
            <button
              onClick={dismiss}
              className="p-1 rounded-full hover:bg-lovefacts-turquoise/10 text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            {(
              [
                { value: 'positive', label: 'Yes!', icon: <ThumbsUp size={16} /> },
                { value: 'neutral', label: 'Meh', icon: <Minus size={16} /> },
                { value: 'negative', label: 'Nope', icon: <ThumbsDown size={16} /> },
              ] as { value: Sentiment; label: string; icon: React.ReactNode }[]
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSentiment(opt.value)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  sentiment === opt.value
                    ? 'bg-lovefacts-coral text-white shadow-md'
                    : 'bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 hover:bg-lovefacts-turquoise/20'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>

          <textarea
            value={missing}
            onChange={(e) => setMissing(e.target.value.slice(0, 200))}
            placeholder="What's missing? (optional, max 200 chars)"
            rows={2}
            className="w-full p-2.5 text-xs rounded-xl bg-lovefacts-turquoise/5 dark:bg-lovefacts-turquoise/10 border border-lovefacts-turquoise/20 text-lovefacts-teal dark:text-white placeholder:text-lovefacts-teal/40 dark:placeholder:text-lovefacts-turquoise/40 focus:outline-none focus:ring-2 focus:ring-lovefacts-coral/40 resize-none"
            maxLength={200}
          />

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full mt-3 py-2 bg-lovefacts-teal hover:bg-lovefacts-teal-light dark:bg-lovefacts-coral dark:hover:bg-lovefacts-coral-dark text-white text-xs font-semibold rounded-xl disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send'}
          </button>
        </motion.div>
      ) : (
        <motion.button
          key="pill"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => setOpen(true)}
          className="fixed right-4 z-40 flex items-center gap-1.5 px-3.5 py-2.5 bg-lovefacts-teal dark:bg-lovefacts-coral text-white rounded-full shadow-xl text-xs font-semibold hover:scale-105 active:scale-95 transition-transform"
          style={{ bottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          aria-label="Send quick feedback"
        >
          <MessageSquarePlus size={14} />
          Quick feedback
        </motion.button>
      )}
    </AnimatePresence>
  )
}
