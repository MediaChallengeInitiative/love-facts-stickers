'use client'

// "Add to WhatsApp" — gets a set of Love Facts stickers into WhatsApp.
//
// The reliable, cross-platform path (Android Chrome AND iPhone Safari) is the
// Web Share API: we fetch the sticker images and hand them to the native share
// sheet, which lets the user drop them straight into a WhatsApp chat. This is
// what actually works on phones, where a downloaded `.wastickers` file does
// nothing on iOS and is unreliable on modern Android.
//
// On desktop (no file sharing) we fall back to downloading a real, spec-valid
// `.wastickers` pack.

import { useState } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { canShareFiles, shareStickerImages } from '@/lib/share-images'

type Target =
  | { kind: 'collection'; collectionId: string; packName?: string }
  | { kind: 'heroes'; packName?: string }
  | { kind: 'custom'; stickerIds: string[]; packName?: string }

interface Props {
  target: Target
  label?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

function requestBody(target: Target, extra: Record<string, unknown> = {}) {
  if (target.kind === 'collection') return { collectionId: target.collectionId, packName: target.packName, ...extra }
  if (target.kind === 'heroes') return { heroOnly: true, packName: target.packName, ...extra }
  return { stickerIds: target.stickerIds, packName: target.packName, ...extra }
}

export function AddToWhatsAppButton({ target, label = 'Add to WhatsApp', className = '', size = 'md' }: Props) {
  const [loading, setLoading] = useState(false)

  const sizeCls =
    size === 'lg'
      ? 'px-5 py-3 text-sm'
      : size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : 'px-4 py-2.5 text-sm'

  // Mobile / Web-Share path: fetch the image list, then share the files.
  const shareImages = async () => {
    const res = await fetch('/api/sticker-pack/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody(target, { format: 'images' })),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Could not load stickers')
      return
    }
    const data: { images?: Array<{ id: string; title: string; sourceUrl: string }> } = await res.json()
    const images = data.images || []
    if (images.length === 0) {
      toast.error('No stickers to share yet')
      return
    }
    await shareStickerImages(images, { title: 'Love Facts stickers' })
  }

  // Desktop / explicit path: download a spec-valid .wastickers pack.
  const downloadPack = async () => {
    const res = await fetch('/api/sticker-pack/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody(target)),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Could not build pack')
      return
    }
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const filename =
      res.headers.get('content-disposition')?.match(/filename="?([^";]+)"?/i)?.[1] || 'love-facts.wastickers'
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 4000)
    toast.success('Pack downloaded — open it to add to WhatsApp')
  }

  const handlePrimary = async () => {
    if (loading) return
    setLoading(true)
    try {
      if (canShareFiles()) {
        await shareImages()
      } else {
        await downloadPack()
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePrimary}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold text-white bg-lovefacts-green hover:bg-lovefacts-green-dark disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-lovefacts-green/30 active:scale-[0.98] transition-all ${sizeCls} ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
      {loading ? 'Opening…' : label}
    </button>
  )
}
