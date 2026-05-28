// One-tap, no-gating sticker download.
// Used by sticker card, preview modal, hero spotlight — anywhere we save a sticker.
// Logs anonymously fire-and-forget so the file lands as fast as possible.

import toast from 'react-hot-toast'

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

export async function downloadSticker(
  sticker: DownloadInput,
  opts: { downloadType?: DownloadType; channel?: string } = {}
): Promise<boolean> {
  const downloadType = opts.downloadType ?? 'single'

  logDownload(sticker.id, downloadType, opts.channel)
  markEngagementForFeedback()

  try {
    const imageRes = await fetch(sticker.sourceUrl)
    if (!imageRes.ok) throw new Error(`HTTP ${imageRes.status}`)
    const blob = await imageRes.blob()
    const ext = (blob.type.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '')
    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = safeFilename(sticker.title, ext)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)

    toast.success('Saved — now share it', { duration: 2500 })
    return true
  } catch (err) {
    console.warn('Direct download failed, falling back:', err)
    // Fallback: open in a new tab so the user can long-press to save on mobile.
    window.open(sticker.sourceUrl, '_blank', 'noopener,noreferrer')
    toast('Long-press the image to save it', { icon: '💡', duration: 4000 })
    return false
  }
}
