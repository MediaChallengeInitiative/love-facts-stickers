import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { startOfDay, subDays, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const startDate = startOfDay(subDays(new Date(), days))

    // Get total downloads
    const totalDownloads = await prisma.download.count()

    // Get downloads in period
    const downloadsInPeriod = await prisma.download.count({
      where: {
        createdAt: { gte: startDate },
      },
    })

    // Get unique users (by email or phone)
    const uniqueEmails = await prisma.download.groupBy({
      by: ['userEmail'],
      where: {
        userEmail: { not: null },
      },
    })

    const uniquePhones = await prisma.download.groupBy({
      by: ['userPhone'],
      where: {
        userPhone: { not: null },
      },
    })

    // Get anonymous downloads
    const anonymousDownloads = await prisma.download.count({
      where: { isAnonymous: true },
    })

    // Get downloads per collection
    const downloadsPerCollection = await prisma.download.groupBy({
      by: ['stickerId'],
      _count: true,
    })

    const stickerIds = downloadsPerCollection.map((d) => d.stickerId)
    const stickers = await prisma.sticker.findMany({
      where: { id: { in: stickerIds } },
      include: { collection: true },
    })

    const collectionStats: Record<string, number> = {}
    for (const download of downloadsPerCollection) {
      const sticker = stickers.find((s) => s.id === download.stickerId)
      if (sticker) {
        const collectionName = sticker.collection.name
        collectionStats[collectionName] = (collectionStats[collectionName] || 0) + download._count
      }
    }

    // Get top stickers
    const topStickers = await prisma.download.groupBy({
      by: ['stickerId'],
      _count: true,
      orderBy: { _count: { stickerId: 'desc' } },
      take: 10,
    })

    const topStickerDetails = await Promise.all(
      topStickers.map(async (item) => {
        const sticker = await prisma.sticker.findUnique({
          where: { id: item.stickerId },
          include: { collection: true },
        })
        return {
          sticker,
          downloads: item._count,
        }
      })
    )

    // Get downloads over time (last 30 days)
    const downloadsOverTime: { date: string; count: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayStart = startOfDay(date)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const count = await prisma.download.count({
        where: {
          createdAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      })

      downloadsOverTime.push({
        date: format(date, 'yyyy-MM-dd'),
        count,
      })
    }

    // Get total visits
    const totalVisits = await prisma.visit.count()

    // Get total collections and stickers
    const totalCollections = await prisma.collection.count()
    const totalStickers = await prisma.sticker.count()

    return NextResponse.json({
      overview: {
        totalDownloads,
        downloadsInPeriod,
        uniqueUsers: uniqueEmails.length + uniquePhones.length,
        anonymousDownloads,
        totalVisits,
        totalCollections,
        totalStickers,
      },
      collectionStats: Object.entries(collectionStats).map(([name, count]) => ({
        name,
        downloads: count,
      })),
      topStickers: topStickerDetails,
      downloadsOverTime,
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
