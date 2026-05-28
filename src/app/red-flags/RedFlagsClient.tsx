'use client'

import { useState } from 'react'
import { StickerGrid } from '@/components/stickers/StickerGrid'
import { StickerPreviewModal } from '@/components/modals/StickerPreviewModal'
import { ShareSheet } from '@/components/share/ShareSheet'
import { downloadSticker } from '@/lib/download'
import { getStickerShareUrl } from '@/lib/urls'
import type { Sticker } from '@/lib/types'

// Server-supplied sticker shape includes Prisma `collection` relation.
type ServerSticker = Sticker & {
  collection: { id: string; name: string; slug?: string }
}

interface Props {
  stickers: ServerSticker[]
}

export function RedFlagsClient({ stickers }: Props) {
  const [previewSticker, setPreviewSticker] = useState<Sticker | null>(null)
  const [shareSubject, setShareSubject] = useState<Sticker | null>(null)

  return (
    <>
      <StickerGrid
        stickers={stickers as Sticker[]}
        onStickerClick={(s) => setPreviewSticker(s)}
        onStickerDownload={(s) => downloadSticker(s, { downloadType: 'single', channel: 'red-flags' })}
        onStickerShare={(s) => setShareSubject(s)}
      />

      <StickerPreviewModal
        sticker={previewSticker}
        isOpen={!!previewSticker}
        onClose={() => setPreviewSticker(null)}
        onDownload={(sticker, type) =>
          downloadSticker(sticker, { downloadType: type, channel: 'red-flags' })
        }
      />

      <ShareSheet
        open={!!shareSubject}
        onClose={() => setShareSubject(null)}
        subject={
          shareSubject
            ? {
                id: shareSubject.id,
                title: shareSubject.title,
                url: getStickerShareUrl(shareSubject.id),
                caption: shareSubject.caption,
                imageUrl: shareSubject.sourceUrl,
              }
            : { id: '', title: '', url: '' }
        }
      />
    </>
  )
}
