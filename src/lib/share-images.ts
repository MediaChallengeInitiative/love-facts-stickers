// Share the sticker IMAGE(S) themselves — no website link.
//
// Uses Web Share API Level 2 (`navigator.share({ files })`), which opens the
// native OS share sheet (WhatsApp, X, Messages, Instagram, …) with the actual
// image attached and NOTHING else. Works on Android Chrome and iOS Safari.
//
// Bytes are always pulled through the same-origin byte proxy so fetch() can
// read them (the raw sticker URL is a cross-origin redirect). When file
// sharing isn't available (most desktops), we fall back to saving the images.

'use client'

import toast from 'react-hot-toast'
import { toProxyBytesUrl } from './image-url'
import { downloadStickers } from './download'

export interface ShareImageItem {
  id: string
  title: string
  sourceUrl: string
}

/** Can this device hand image files to other apps via the native share sheet? */
export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined') return false
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return false
  try {
    const probe = new File([new Uint8Array([0])], 'probe.png', { type: 'image/png' })
    return navigator.canShare({ files: [probe] })
  } catch {
    return false
  }
}

function safeName(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${slug || 'love-facts-sticker'}.png`
}

async function toFile(item: ShareImageItem): Promise<File | null> {
  try {
    const res = await fetch(toProxyBytesUrl(item.sourceUrl), { cache: 'force-cache' })
    if (!res.ok) return null
    const blob = await res.blob()
    const type = blob.type || 'image/png'
    const ext = (type.split('/')[1] || 'png').replace(/[^a-z0-9]/gi, '')
    return new File([blob], safeName(item.title).replace(/\.png$/, `.${ext}`), { type })
  } catch {
    return null
  }
}

/**
 * Share one or more sticker images via the native share sheet — no link.
 * Returns true if the share sheet was successfully invoked.
 *
 * @param items   stickers to share
 * @param opts.title   optional title shown in the share sheet (no URL is sent)
 * @param opts.onTrack fired once with the channel id for telemetry
 */
export async function shareStickerImages(
  items: ShareImageItem[],
  opts: { title?: string; onTrack?: () => void } = {}
): Promise<boolean> {
  if (items.length === 0) return false

  // Build the File objects first so we can feature-detect accurately.
  const loading = toast.loading(items.length > 1 ? 'Preparing images…' : 'Preparing image…')
  const files = (await Promise.all(items.map(toFile))).filter((f): f is File => f !== null)
  toast.dismiss(loading)

  if (files.length === 0) {
    toast.error("Couldn't load the image — please try again")
    return false
  }

  const canShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    (typeof navigator.canShare !== 'function' || navigator.canShare({ files }))

  if (canShare) {
    try {
      opts.onTrack?.()
      await navigator.share({
        files,
        title: opts.title || 'Love Facts stickers',
        // Deliberately NO `url` — the user asked to share the image, not a link.
      })
      return true
    } catch (err) {
      // AbortError = user dismissed the sheet; treat as a non-error.
      if (err instanceof DOMException && err.name === 'AbortError') return false
      // Otherwise fall through to the download fallback.
    }
  }

  // Desktop / unsupported: save the images so the user can attach them manually.
  toast('Saving images so you can attach them', { icon: '💾' })
  await downloadStickers(items, { channel: 'image-share-fallback' })
  return false
}
