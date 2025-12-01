export interface PreviewSticker {
  id: string
  title: string
  thumbnailUrl: string
}

export interface Collection {
  id: string
  name: string
  slug: string
  description?: string | null
  coverImage?: string | null
  driveFolderId?: string | null
  previewStickers?: PreviewSticker[]
  _count?: {
    stickers: number
  }
}

export interface Sticker {
  id: string
  title: string
  thumbnailUrl: string
  sourceUrl: string
  caption?: string | null
  tags: string[]
  collectionId: string
  collection: {
    id: string
    name: string
    slug?: string
  }
}

export interface Download {
  id: string
  stickerId: string
  userEmail?: string | null
  userPhone?: string | null
  userName?: string | null
  isAnonymous: boolean
  downloadType: string
  createdAt: string
  sticker: {
    id: string
    title: string
    collection: {
      name: string
    }
  }
}
