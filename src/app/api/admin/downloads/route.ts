import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { formatDateTime } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const stickerId = searchParams.get('stickerId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') // 'json' or 'csv'

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { userEmail: { contains: search, mode: 'insensitive' } },
        { userPhone: { contains: search } },
        { userName: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (stickerId) {
      where.stickerId = stickerId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = new Date(startDate)
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = new Date(endDate)
      }
    }

    const [downloads, total] = await Promise.all([
      prisma.download.findMany({
        where,
        skip: format === 'csv' ? 0 : skip,
        take: format === 'csv' ? undefined : limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sticker: {
            include: {
              collection: true,
            },
          },
        },
      }),
      prisma.download.count({ where }),
    ])

    // CSV export
    if (format === 'csv') {
      const csvRows = [
        ['ID', 'Sticker', 'Collection', 'Email', 'Phone', 'Name', 'Anonymous', 'Type', 'IP', 'Date'],
      ]

      for (const download of downloads) {
        csvRows.push([
          download.id,
          download.sticker.title,
          download.sticker.collection.name,
          download.userEmail || '',
          download.userPhone || '',
          download.userName || '',
          download.isAnonymous ? 'Yes' : 'No',
          download.downloadType,
          download.ipAddress || '',
          formatDateTime(download.createdAt),
        ])
      }

      const csvContent = csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="downloads-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({
      downloads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching downloads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch downloads' },
      { status: 500 }
    )
  }
}
