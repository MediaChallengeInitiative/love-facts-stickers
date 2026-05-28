import type { MetadataRoute } from 'next'
import prisma from '@/lib/db'
import { getBaseUrl } from '@/lib/urls'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/red-flags`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/unsubscribe`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  let stickerRoutes: MetadataRoute.Sitemap = []
  try {
    const stickers = await prisma.sticker.findMany({
      select: { id: true, updatedAt: true, shortCode: true, isHero: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    })
    stickerRoutes = stickers.flatMap((s) => {
      const entries: MetadataRoute.Sitemap = [
        {
          url: `${baseUrl}/sticker/${s.id}`,
          lastModified: s.updatedAt,
          changeFrequency: 'weekly',
          priority: s.isHero ? 0.9 : 0.6,
        },
      ]
      if (s.shortCode) {
        entries.push({
          url: `${baseUrl}/s/${s.shortCode}`,
          lastModified: s.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.4,
        })
      }
      return entries
    })
  } catch (err) {
    console.warn('Sitemap: sticker query failed, falling back to static-only', err)
  }

  let collectionRoutes: MetadataRoute.Sitemap = []
  try {
    const collections = await prisma.collection.findMany({
      select: { slug: true, updatedAt: true },
    })
    collectionRoutes = collections.map((c) => ({
      url: `${baseUrl}/?collection=${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  } catch (err) {
    console.warn('Sitemap: collection query failed', err)
  }

  return [...staticRoutes, ...collectionRoutes, ...stickerRoutes]
}
