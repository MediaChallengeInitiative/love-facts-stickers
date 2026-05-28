import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import StickerSharePage from './StickerSharePage'

interface Props {
  params: Promise<{ id: string }>
}

async function getSticker(id: string) {
  try {
    return await prisma.sticker.findUnique({
      where: { id },
      include: { collection: true },
    })
  } catch (error) {
    console.error('Error fetching sticker:', error)
    return null
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://stickers.lovefacts.africa'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const sticker = await getSticker(id)

  if (!sticker) {
    return { title: 'Sticker Not Found' }
  }

  const ogImageUrl = sticker.sourceUrl.startsWith('http')
    ? sticker.sourceUrl
    : `${SITE_URL}${sticker.sourceUrl}`

  const title = `${sticker.title} — Love Facts Sticker`
  const description =
    sticker.seoDescription ||
    sticker.caption ||
    `${sticker.title}: a free media literacy sticker from the ${sticker.collection.name} collection. Save it and send on WhatsApp, Telegram, or any chat app.`

  return {
    title,
    description,
    alternates: { canonical: `/sticker/${sticker.id}` },
    openGraph: {
      title,
      description,
      url: `/sticker/${sticker.id}`,
      images: [
        {
          url: ogImageUrl,
          width: sticker.width || 800,
          height: sticker.height || 800,
          alt: sticker.title,
          type: sticker.mimeType || 'image/png',
        },
      ],
      type: 'article',
      siteName: 'Love Facts Stickers',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function StickerPage({ params }: Props) {
  const { id } = await params
  const sticker = await getSticker(id)

  if (!sticker) {
    notFound()
  }

  const ogImageUrl = sticker.sourceUrl.startsWith('http')
    ? sticker.sourceUrl
    : `${SITE_URL}${sticker.sourceUrl}`

  // Per-page structured data. ImageObject is the right schema for a
  // standalone sticker; we also emit a BreadcrumbList for sitelinks.
  const imageObjectLd = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: ogImageUrl,
    name: sticker.title,
    description:
      sticker.seoDescription ||
      sticker.caption ||
      `${sticker.title} — Love Facts sticker, ${sticker.collection.name} collection.`,
    width: sticker.width || undefined,
    height: sticker.height || undefined,
    encodingFormat: sticker.mimeType || 'image/png',
    keywords: sticker.tags?.join(', '),
    license: 'https://creativecommons.org/licenses/by-sa/4.0/',
    acquireLicensePage: `${SITE_URL}/privacy`,
    creator: {
      '@type': 'Organization',
      name: 'Media Challenge Initiative',
      url: 'https://mciug.org',
    },
    creditText: 'Media Challenge Initiative',
    copyrightNotice: '© Media Challenge Initiative — CC BY-SA 4.0',
    uploadDate: sticker.createdAt.toISOString(),
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ShareAction',
        userInteractionCount: sticker.shareCount,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/ViewAction',
        userInteractionCount: sticker.viewCount,
      },
    ],
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: sticker.collection.name,
        item: `${SITE_URL}/?collection=${sticker.collection.slug}`,
      },
      { '@type': 'ListItem', position: 3, name: sticker.title, item: `${SITE_URL}/sticker/${sticker.id}` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(imageObjectLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <StickerSharePage sticker={sticker} />
    </>
  )
}
