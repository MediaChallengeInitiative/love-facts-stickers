import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import StickerSharePage from './StickerSharePage'

interface Props {
  params: { id: string }
}

async function getSticker(id: string) {
  try {
    const sticker = await prisma.sticker.findUnique({
      where: { id },
      include: {
        collection: true,
      },
    })
    return sticker
  } catch (error) {
    console.error('Error fetching sticker:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sticker = await getSticker(params.id)
  
  if (!sticker) {
    return {
      title: 'Sticker Not Found - Love Facts',
    }
  }

  const ogImageUrl = sticker.sourceUrl.startsWith('http') 
    ? sticker.sourceUrl 
    : `${process.env.NEXT_PUBLIC_APP_URL || 'https://stickers.lovefacts.africa'}${sticker.sourceUrl}`

  return {
    title: `${sticker.title} - Love Facts Media Literacy Stickers`,
    description: sticker.caption || `Share this ${sticker.collection.name} sticker to spread media literacy!`,
    openGraph: {
      title: `${sticker.title} - Love Facts`,
      description: sticker.caption || `Check out this media literacy sticker from the ${sticker.collection.name} collection!`,
      images: [
        {
          url: ogImageUrl,
          width: sticker.width || 800,
          height: sticker.height || 800,
          alt: sticker.title,
        },
      ],
      type: 'website',
      siteName: 'Love Facts Stickers',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${sticker.title} - Love Facts`,
      description: sticker.caption || `Check out this media literacy sticker!`,
      images: [ogImageUrl],
    },
  }
}

export default async function StickerPage({ params }: Props) {
  const sticker = await getSticker(params.id)

  if (!sticker) {
    notFound()
  }

  return <StickerSharePage sticker={sticker} />
}