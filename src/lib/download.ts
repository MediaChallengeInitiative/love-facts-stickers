// One-tap, no-gating sticker download.
// Used by sticker card, preview modal, hero spotlight — anywhere we save a sticker.
// Logs anonymously fire-and-forget so the file lands as fast as possible.
//
// Downloads ALWAYS go through the same-origin byte proxy (`?proxy=1`). The raw
// sticker URL is a 302 redirect to Google's CDN; fetching it cross-origin
// throws on CORS, and the old fallback (`window.open`) bounced the user to a
// Google Drive page. We never redirect off-site any more — a genuine failure
// shows a toast instead.

import toast from 'react-hot-toast'
import { toProxyBytesUrl } from './image-url'

type DownloadInput = {
  id: string
  title: string
  sourceUrl: string
}

export type DownloadType = 'single' | 'collection' | 'pack'

function safeFilename(title: string, ext = 'png'): string {
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'love-facts-sticker'}.${ext}`
}

function logDownload(stickerId: string, downloadType: DownloadType, channel?: string) {
  // Fire-and-forget. Never await. Never blocks the user.
  fetch('/api/download-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stickerId,
      isAnonymous: true,
      downloadType,
      channel,
    }),
  }).catch(() => {
    /* swallow — telemetry must never block UX */
  })
}

function markEngagementForFeedback() {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem('lf:engaged', '1')
    window.dispatchEvent(new CustomEvent('lf:engaged'))
  } catch {
    /* sessionStorage may be unavailable in private mode */
  }
}

// Fetch a sticker as a Blob through the same-origin byte proxy.
async function fetchStickerBlob(sourceUrl: string): Promise<Blob> {
  const res = await fetch(toProxyBytesUrl(sourceUrl), { cache: 'force-cache' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.blob()
}

// Trigger an instant in-page save of an already-fetched blob. No navigation.
function saveBlob(blob: Blob, title: string): void {
  const ext = (blob.type.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '')
  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = safeFilename(title, ext)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(blobUrl), 4000)
}

export async function downloadSticker(
  sticker: DownloadInput,
  opts: { downloadType?: DownloadType; channel?: string; silent?: boolean } = {}
): Promise<boolean> {
  const downloadType = opts.downloadType ?? 'single'

  logDownload(sticker.id, downloadType, opts.channel)
  markEngagementForFeedback()

  try {
    const blob = await fetchStickerBlob(sticker.sourceUrl)
    saveBlob(blob, sticker.title)
    if (!opts.silent) toast.success('Saved — now share it', { duration: 2500 })
    return true
  } catch (err) {
    console.warn('Download failed:', err)
    if (!opts.silent) {
      toast.error('Could not save — please try again', { duration: 3500 })
    }
    return false
  }
}

// Download multiple stickers as individual instant saves. Sequential so the
// browser doesn't drop concurrent download prompts; each blob is fetched from
// our own origin so nothing redirects off-site.
export async function downloadStickers(
  stickers: DownloadInput[],
  opts: { channel?: string } = {}
): Promise<number> {
  let saved = 0
  const total = stickers.length
  const id = toast.loading(`Saving ${total} sticker${total === 1 ? '' : 's'}…`)

  for (const sticker of stickers) {
    const ok = await downloadSticker(sticker, {
      downloadType: 'collection',
      channel: opts.channel,
      silent: true,
    })
    if (ok) saved++
    // Small gap so mobile browsers register each save separately.
    await new Promise((r) => setTimeout(r, 350))
  }

  if (saved === total) {
    toast.success(`Saved ${saved} sticker${saved === 1 ? '' : 's'}`, { id })
  } else if (saved > 0) {
    toast.success(`Saved ${saved} of ${total} — some couldn't load`, { id })
  } else {
    toast.error("Couldn't save the stickers — please try again", { id })
  }
  return saved
}
