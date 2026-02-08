import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Prevent Next.js/Vercel from caching this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get('collection')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (collectionId) {
      where.collectionId = collectionId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ]
    }

    const [stickers, total] = await Promise.all([
      prisma.sticker.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          collection: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.sticker.count({ where }),
    ])

    const response = NextResponse.json({
      stickers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    response.headers.set('CDN-Cache-Control', 'no-store')
    response.headers.set('Vercel-CDN-Cache-Control', 'no-store')
    return response
  } catch (error) {
    console.error('Error fetching stickers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stickers' },
      { status: 500 }
    )
  }
}
