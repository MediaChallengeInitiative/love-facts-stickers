import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sticker = await prisma.sticker.findUnique({
      where: { id: params.id },
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!sticker) {
      return NextResponse.json(
        { error: 'Sticker not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(sticker)
  } catch (error) {
    console.error('Error fetching sticker:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sticker' },
      { status: 500 }
    )
  }
}
