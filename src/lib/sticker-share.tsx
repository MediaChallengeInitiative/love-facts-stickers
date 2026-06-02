'use client'

// Shared one-tap save flow used by the home page and the category pages so the
// download + "send onward on WhatsApp" UX stays identical everywhere.

import toast from 'react-hot-toast'
import { MessageCircle } from 'lucide-react'
import { downloadSticker } from './download'
import { getStickerShareUrl } from './urls'
import type { Sticker } from './types'

/**
 * Save a sticker to the device, then surface a toast whose primary action is a
 * one-tap WhatsApp send — the obvious next move after saving.
 */
export async function downloadStickerWithToast(
  sticker: Sticker,
  type: 'single' | 'collection' = 'single'
): Promise<void> {
  await downloadSticker(sticker, { downloadType: type })

  const shareUrl = getStickerShareUrl(sticker.id)
  const text = sticker.caption || `Check out: ${sticker.title} — from Love Facts`
  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`

  toast.custom(
    (t) => (
      <div
        className={`max-w-sm w-full bg-white dark:bg-lovefacts-teal shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-lovefacts-turquoise/30 ${
          t.visible ? 'animate-enter' : 'animate-leave'
        }`}
      >
        <div className="flex-1 p-4 flex items-center gap-3">
          <div className="text-2xl">✅</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-lovefacts-teal dark:text-white">Saved</p>
            <p className="text-xs text-lovefacts-teal/60 dark:text-lovefacts-turquoise/70 truncate">
              {sticker.title}
            </p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => toast.dismiss(t.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-lovefacts-green text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-lovefacts-green-dark transition-colors"
          >
            <MessageCircle size={14} />
            Send
          </a>
        </div>
      </div>
    ),
    { duration: 4500 }
  )
}
