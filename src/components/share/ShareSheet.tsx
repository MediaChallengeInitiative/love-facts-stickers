'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  Send,
  Music2,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Ghost,
  Mail,
  Copy,
  ImageIcon,
  Share2,
  X,
} from 'lucide-react'
import { useShareEngine, type ShareChannelId, type ShareSubject } from '@/lib/share-engine'

const CHANNEL_ICONS: Record<ShareChannelId, React.ReactNode> = {
  whatsapp: <MessageCircle size={18} />,
  'whatsapp-status': <MessageCircle size={18} />,
  telegram: <Send size={18} />,
  tiktok: <Music2 size={18} />,
  facebook: <FacebookIcon size={18} />,
  instagram: <InstagramIcon size={18} />,
  x: <XIcon />,
  snapchat: <Ghost size={18} />,
  sms: <MessageCircle size={18} />,
  email: <Mail size={18} />,
  copy: <Copy size={18} />,
  'copy-image': <ImageIcon size={18} />,
  native: <Share2 size={18} />,
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

interface ShareSheetProps {
  subject: ShareSubject
  open: boolean
  onClose: () => void
}

export function ShareSheet({ subject, open, onClose }: ShareSheetProps) {
  const { channels, primary, share } = useShareEngine(subject)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label="Share sticker"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-lovefacts-teal rounded-t-3xl shadow-2xl max-h-[85svh] landscape:max-h-[92svh] overflow-y-auto pb-safe"
            style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
          >
            <div className="sticky top-0 bg-white dark:bg-lovefacts-teal pt-3 pb-2 px-4 border-b border-lovefacts-turquoise/10 dark:border-lovefacts-turquoise/20 flex items-center justify-between">
              <div className="w-12 h-1.5 bg-lovefacts-turquoise/30 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 -top-0.5" />
              <h3 className="text-base font-bold text-lovefacts-teal dark:text-white">Send this sticker</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-lovefacts-turquoise/10 dark:hover:bg-lovefacts-turquoise/20 text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60"
                aria-label="Close share sheet"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 pb-8">
              <button
                onClick={async () => {
                  await primary.run()
                  onClose()
                }}
                style={{ backgroundColor: primary.brandColor }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-lg active:scale-[0.98] transition-transform"
              >
                {CHANNEL_ICONS[primary.id]}
                Send via {primary.label}
              </button>

              <p className="text-[11px] text-lovefacts-teal/50 dark:text-lovefacts-turquoise/50 text-center mt-2">
                Or pick another app
              </p>

              <div className="mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                {channels
                  .filter((c) => c.id !== primary.id)
                  .map((channel) => (
                    <button
                      key={channel.id}
                      onClick={async () => {
                        await share(channel.id)
                        onClose()
                      }}
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-lovefacts-turquoise/5 dark:bg-lovefacts-turquoise/10 hover:bg-lovefacts-turquoise/15 dark:hover:bg-lovefacts-turquoise/20 active:scale-95 transition-all"
                    >
                      <span
                        className="flex items-center justify-center w-10 h-10 rounded-full text-white"
                        style={{ backgroundColor: channel.brandColor }}
                      >
                        {CHANNEL_ICONS[channel.id]}
                      </span>
                      <span className="text-[10px] text-lovefacts-teal/80 dark:text-lovefacts-turquoise/80 text-center leading-tight">
                        {channel.label}
                      </span>
                    </button>
                  ))}
              </div>

              {subject.caption && (
                <div className="mt-5 p-3 bg-lovefacts-turquoise/5 dark:bg-lovefacts-turquoise/10 rounded-xl">
                  <p className="text-[10px] uppercase tracking-wide text-lovefacts-teal/50 dark:text-lovefacts-turquoise/50 mb-1">
                    Suggested caption
                  </p>
                  <p className="text-xs text-lovefacts-teal dark:text-white italic leading-relaxed">
                    &ldquo;{subject.caption}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
