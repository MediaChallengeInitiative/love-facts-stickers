import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Returns the curated hero stickers — Silas's "10 strong stickers to push".
// If none are flagged isHero yet, falls back to the top 10 by shareCount so
// the spotlight is never empty.
export async function GET() {
  try {
    const heroes = await prisma.sticker.findMany({
      where: { isHero: true },
      include: { collection: { select: { id: true, name: true, slug: true } } },
      orderBy: [{ heroRank: 'asc' }, { shareCount: 'desc' }],
      take: 12,
    })

    let stickers = heroes
    if (heroes.length === 0) {
      stickers = await prisma.sticker.findMany({
        include: { collection: { select: { id: true, name: true, slug: true } } },
        orderBy: [{ shareCount: 'desc' }, { createdAt: 'desc' }],
        take: 10,
      })
    }

    const response = NextResponse.json({ stickers, isFallback: heroes.length === 0 })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (error) {
    console.error('Hero stickers fetch failed:', error)
    return NextResponse.json({ stickers: [], isFallback: true })
  }
}
