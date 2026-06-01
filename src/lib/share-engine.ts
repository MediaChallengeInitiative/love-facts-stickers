// Love Facts share engine.
// One module, every channel that matters in Uganda. The UI binds to this hook
// and doesn't care about URL schemes — channels can be reordered, added, or
// disabled without touching components.
//
// Channel priority is dynamic: we promote the user's last-used channel to the
// "primary" slot via localStorage so a repeat WhatsApp sharer doesn't have to
// re-discover the button each visit.

'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { toProxyBytesUrl } from './image-url'
import { shareStickerImages } from './share-images'

export type ShareChannelId =
  | 'whatsapp'
  | 'whatsapp-status'
  | 'telegram'
  | 'tiktok'
  | 'facebook'
  | 'instagram'
  | 'x'
  | 'snapchat'
  | 'sms'
  | 'email'
  | 'copy'
  | 'copy-image'
  | 'native'

export interface ShareSubject {
  id: string
  title: string
  url: string
  caption?: string | null
  imageUrl?: string // direct PNG/WebP for image-clipboard + Web Share file
}

export interface ShareChannel {
  id: ShareChannelId
  label: string
  brandColor: string // hex, for accent tinting
  available: boolean // some channels need feature-detection
  run: () => Promise<void> | void
}

const LAST_CHANNEL_KEY = 'lf:share:last'

function track(channel: ShareChannelId | 'image', stickerId: string) {
  fetch(`/api/sticker/${stickerId}/share-track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel }),
  }).catch(() => undefined)

  try {
    sessionStorage.setItem('lf:engaged', '1')
    window.dispatchEvent(new CustomEvent('lf:engaged'))
  } catch {
    /* ignore */
  }
}

function rememberChannel(channel: ShareChannelId) {
  try {
    localStorage.setItem(LAST_CHANNEL_KEY, channel)
  } catch {
    /* ignore */
  }
}

async function fetchImageBlob(url: string): Promise<Blob | null> {
  try {
    // Always go through the same-origin byte proxy — the raw sticker URL is a
    // cross-origin redirect and would throw on CORS.
    const res = await fetch(toProxyBytesUrl(url), { cache: 'force-cache' })
    if (!res.ok) return null
    return await res.blob()
  } catch {
    return null
  }
}

export function useShareEngine(subject: ShareSubject) {
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [canNativeShareFiles, setCanNativeShareFiles] = useState(false)
  const [lastChannel, setLastChannel] = useState<ShareChannelId | null>(null)

  useEffect(() => {
    if (typeof navigator === 'undefined') return
    setCanNativeShare(typeof navigator.share === 'function')
    // canShare({ files }) tells us if Status / Instagram-stories file-handoff is possible
    if (typeof navigator.canShare === 'function') {
      try {
        const probe = new File([new Uint8Array([0])], 'probe.png', { type: 'image/png' })
        setCanNativeShareFiles(navigator.canShare({ files: [probe] }))
      } catch {
        setCanNativeShareFiles(false)
      }
    }
    try {
      const stored = localStorage.getItem(LAST_CHANNEL_KEY) as ShareChannelId | null
      if (stored) setLastChannel(stored)
    } catch {
      /* ignore */
    }
  }, [])

  const text = subject.caption || `Check out: ${subject.title} — from Love Facts`
  const urlText = `${text}\n${subject.url}`

  const channels: ShareChannel[] = useMemo(() => {
    const encodedText = encodeURIComponent(text)
    const encodedUrl = encodeURIComponent(subject.url)
    const encodedBoth = encodeURIComponent(urlText)

    const open = (href: string) => window.open(href, '_blank', 'noopener,noreferrer')

    const channelDefs: ShareChannel[] = [
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        brandColor: '#25D366',
        available: true,
        run: () => {
          track('whatsapp', subject.id)
          rememberChannel('whatsapp')
          open(`https://wa.me/?text=${encodedBoth}`)
        },
      },
      {
        id: 'whatsapp-status',
        label: 'WhatsApp Status',
        brandColor: '#128C7E',
        available: canNativeShareFiles && !!subject.imageUrl,
        run: async () => {
          track('whatsapp-status', subject.id)
          rememberChannel('whatsapp-status')
          const blob = subject.imageUrl ? await fetchImageBlob(subject.imageUrl) : null
          if (blob && typeof navigator !== 'undefined' && navigator.share) {
            const file = new File([blob], `${subject.title}.png`, { type: blob.type || 'image/png' })
            try {
              await navigator.share({ files: [file], text, title: subject.title })
              return
            } catch {
              /* fall through */
            }
          }
          toast(
            'Save the sticker first, then post it to your WhatsApp Status.',
            { icon: '💡', duration: 4500 }
          )
        },
      },
      {
        id: 'telegram',
        label: 'Telegram',
        brandColor: '#229ED9',
        available: true,
        run: () => {
          track('telegram', subject.id)
          rememberChannel('telegram')
          open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`)
        },
      },
      {
        id: 'tiktok',
        label: 'TikTok',
        brandColor: '#000000',
        available: true,
        run: async () => {
          track('tiktok', subject.id)
          rememberChannel('tiktok')
          // TikTok has no public web share intent — copy the caption so the
          // user can paste it in the app, then open the upload URL.
          try {
            await navigator.clipboard.writeText(text)
            toast.success('Caption copied — open TikTok and paste it')
          } catch {
            /* ignore */
          }
          open('https://www.tiktok.com/upload')
        },
      },
      {
        id: 'facebook',
        label: 'Facebook',
        brandColor: '#1877F2',
        available: true,
        run: () => {
          track('facebook', subject.id)
          rememberChannel('facebook')
          open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`)
        },
      },
      {
        id: 'instagram',
        label: 'Instagram',
        brandColor: '#E1306C',
        available: true,
        run: async () => {
          track('instagram', subject.id)
          rememberChannel('instagram')
          try {
            await navigator.clipboard.writeText(`${text}\n${subject.url}`)
            toast.success('Caption + link copied — open Instagram and paste')
          } catch {
            toast('Open Instagram and share manually', { icon: '📸' })
          }
        },
      },
      {
        id: 'x',
        label: 'X (Twitter)',
        brandColor: '#000000',
        available: true,
        run: () => {
          track('x', subject.id)
          rememberChannel('x')
          open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`)
        },
      },
      {
        id: 'snapchat',
        label: 'Snapchat',
        brandColor: '#FFFC00',
        available: true,
        run: () => {
          track('snapchat', subject.id)
          rememberChannel('snapchat')
          // Snapchat Creative Kit deep link — opens the camera with the URL
          // ready to attach if the app is installed.
          open(`https://www.snapchat.com/scan?attachmentUrl=${encodedUrl}`)
        },
      },
      {
        id: 'sms',
        label: 'SMS',
        brandColor: '#34A853',
        available: true,
        run: () => {
          track('sms', subject.id)
          rememberChannel('sms')
          // Both Android and iOS accept ?&body=
          window.location.href = `sms:?&body=${encodedBoth}`
        },
      },
      {
        id: 'email',
        label: 'Email',
        brandColor: '#0A3D4C',
        available: true,
        run: () => {
          track('email', subject.id)
          rememberChannel('email')
          const subj = encodeURIComponent('A Love Facts sticker for you')
          window.location.href = `mailto:?subject=${subj}&body=${encodedBoth}`
        },
      },
      {
        id: 'copy',
        label: 'Copy link',
        brandColor: '#D6534A',
        available: true,
        run: async () => {
          track('copy', subject.id)
          rememberChannel('copy')
          try {
            await navigator.clipboard.writeText(`${text}\n${subject.url}`)
            toast.success('Caption + link copied')
          } catch {
            toast.error('Could not copy — long-press to select instead')
          }
        },
      },
      {
        id: 'copy-image',
        label: 'Copy image',
        brandColor: '#4FC9A0',
        available: typeof navigator !== 'undefined' && 'clipboard' in navigator && 'write' in navigator.clipboard,
        run: async () => {
          track('copy-image', subject.id)
          rememberChannel('copy-image')
          if (!subject.imageUrl) return
          const blob = await fetchImageBlob(subject.imageUrl)
          if (!blob) {
            toast.error('Could not load image')
            return
          }
          try {
            const ClipboardItemCtor = (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem
            if (!ClipboardItemCtor) throw new Error('no ClipboardItem')
            await navigator.clipboard.write([new ClipboardItemCtor({ [blob.type]: blob })])
            toast.success('Image copied — paste it in any chat')
          } catch {
            toast('Long-press the image to copy it', { icon: '💡' })
          }
        },
      },
      {
        id: 'native',
        label: 'More…',
        brandColor: '#0A3D4C',
        available: canNativeShare,
        run: async () => {
          track('native', subject.id)
          rememberChannel('native')
          try {
            await navigator.share({ title: subject.title, text, url: subject.url })
          } catch {
            /* user cancelled */
          }
        },
      },
    ]

    return channelDefs.filter((c) => c.available)
  }, [subject.id, subject.url, subject.imageUrl, subject.title, text, urlText, canNativeShare, canNativeShareFiles])

  const primary = useMemo<ShareChannel>(() => {
    if (lastChannel) {
      const found = channels.find((c) => c.id === lastChannel)
      if (found) return found
    }
    return channels.find((c) => c.id === 'whatsapp') || channels[0]
  }, [channels, lastChannel])

  const share = useCallback(
    async (channelId: ShareChannelId) => {
      const channel = channels.find((c) => c.id === channelId)
      if (!channel) return
      await channel.run()
    },
    [channels]
  )

  // Direct image share (no link): hands the sticker image file to the native
  // share sheet so it can go to WhatsApp, X, Messages, etc. with no URL.
  const canShareImage = canNativeShareFiles && !!subject.imageUrl
  const shareImage = useCallback(async () => {
    if (!subject.imageUrl) return
    await shareStickerImages(
      [{ id: subject.id, title: subject.title, sourceUrl: subject.imageUrl }],
      {
        title: subject.title,
        onTrack: () => track('image', subject.id),
      }
    )
  }, [subject.id, subject.title, subject.imageUrl])

  return { channels, primary, share, canShareImage, shareImage }
}
