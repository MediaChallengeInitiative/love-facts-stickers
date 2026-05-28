'use client'

// "Add to WhatsApp" — triggers the WhatsApp sticker-pack download for the
// requested target (a collection, the curated heroes, or an arbitrary list).
//
// On Android, downloading a file with mimetype `application/wastickers` opens
// WhatsApp's "Add sticker pack" handler. iOS has no equivalent web flow, so we
// detect iOS and show a small instruction sheet pointing at the assets.

import { useState } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

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

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export function AddToWhatsAppButton({ target, label = 'Add to WhatsApp', className = '', size = 'md' }: Props) {
  const [loading, setLoading] = useState(false)
  const [iosNotice, setIosNotice] = useState(false)

  const sizeCls =
    size === 'lg'
      ? 'px-5 py-3 text-sm'
      : size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : 'px-4 py-2.5 text-sm'

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      const body =
        target.kind === 'collection'
          ? { collectionId: target.collectionId, packName: target.packName }
          : target.kind === 'heroes'
          ? { heroOnly: true, packName: target.packName }
          : { stickerIds: target.stickerIds, packName: target.packName }

      const res = await fetch('/api/sticker-pack/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
      URL.revokeObjectURL(blobUrl)

      if (isIOS()) {
        setIosNotice(true)
      } else {
        toast.success('Pack downloaded — open it to add to WhatsApp')
      }
    } catch (err) {
      console.error(err)
      toast.error('Could not download pack — try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl font-semibold text-white bg-lovefacts-green hover:bg-lovefacts-green-dark disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-lovefacts-green/30 active:scale-[0.98] transition-all ${sizeCls} ${className}`}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
        {loading ? 'Building pack…' : label}
      </button>

      {iosNotice && (
        <div className="fixed inset-x-4 bottom-5 z-50 max-w-md mx-auto bg-white dark:bg-lovefacts-teal rounded-2xl shadow-2xl p-4 border border-lovefacts-turquoise/20">
          <p className="text-sm font-bold text-lovefacts-teal dark:text-white">Pack saved</p>
          <p className="text-xs text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 mt-1 leading-relaxed">
            On iPhone, WhatsApp doesn&apos;t install web sticker packs directly. For now, save each sticker
            individually using the <strong>Save</strong> button — they&apos;ll show up in WhatsApp&apos;s photo
            picker. Pack-import for iOS coming soon.
          </p>
          <button
            onClick={() => setIosNotice(false)}
            className="mt-3 w-full py-2 bg-lovefacts-teal text-white rounded-xl text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      )}
    </>
  )
}
