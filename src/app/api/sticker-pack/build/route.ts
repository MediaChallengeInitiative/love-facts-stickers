import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'
import { buildStickerPack } from '@/lib/wastickers'
import { toAbsoluteProxyBytesUrl } from '@/lib/image-url'

// Sharp + JSZip both need Node runtime. The default edge runtime would refuse.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const buildSchema = z.object({
  stickerIds: z.array(z.string().min(1)).min(3).max(30).optional(),
  collectionId: z.string().min(1).optional(),
  heroOnly: z.boolean().optional(),
  packName: z.string().max(80).optional(),
  // 'pack' (default) streams a .wastickers ZIP; 'images' returns a JSON list of
  // the resolved sticker image URLs for the mobile "share images" flow.
  format: z.enum(['pack', 'images']).optional(),
})

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://stickers.lovefacts.africa'
const PUBLISHER = 'Media Challenge Initiative'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = buildSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { stickerIds, collectionId, heroOnly, packName, format } = parsed.data

    const whereClauses: Array<Record<string, unknown>> = []
    if (stickerIds && stickerIds.length > 0) whereClauses.push({ id: { in: stickerIds } })
    if (collectionId) whereClauses.push({ collectionId })
    if (heroOnly) whereClauses.push({ isHero: true })
    const where = whereClauses.length > 0 ? { AND: whereClauses } : {}

    const stickerRows = await prisma.sticker.findMany({
      where,
      include: { collection: { select: { name: true, slug: true } } },
      orderBy: heroOnly ? [{ heroRank: 'asc' }] : [{ createdAt: 'desc' }],
      take: 30,
    })

    // The 'images' mode powers the mobile share flow: return the resolved
    // sticker list with same-origin byte URLs the client can fetch into Files.
    if (format === 'images') {
      if (stickerRows.length === 0) {
        return NextResponse.json({ error: 'No stickers found', images: [] }, { status: 404 })
      }
      return NextResponse.json({
        images: stickerRows.map((s) => ({
          id: s.id,
          title: s.title,
          // Relative on purpose — the browser resolves it against the site origin.
          sourceUrl: s.sourceUrl,
        })),
      })
    }

    if (stickerRows.length < 3) {
      return NextResponse.json(
        {
          error: 'Need at least 3 stickers to build a WhatsApp pack',
          have: stickerRows.length,
        },
        { status: 400 }
      )
    }

    // Identifier must be stable per pack so WhatsApp recognises updates vs
    // a new pack. Derive from the inputs.
    const idSource =
      collectionId ||
      (heroOnly ? 'heroes' : null) ||
      (stickerIds && stickerIds.length > 0 ? stickerIds.slice().sort().join('-').slice(0, 40) : 'custom')
    const identifier = `lovefacts-${idSource}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64)

    const name =
      packName ||
      (heroOnly
        ? 'Love Facts — Top picks'
        : stickerRows[0].collection?.name
        ? `Love Facts — ${stickerRows[0].collection.name}`
        : 'Love Facts Stickers')

    const { buffer, filename } = await buildStickerPack(
      stickerRows.map((s) => ({
        id: s.id,
        title: s.title,
        // Fetch through our own byte proxy at sticker resolution. The raw
        // sourceUrl is a 302 to Google's CDN that sharp can't reliably read;
        // the proxy returns clean image bytes server-side.
        sourceUrl: toAbsoluteProxyBytesUrl(s.sourceUrl, SITE_URL, 512),
      })),
      {
        identifier,
        name,
        publisher: PUBLISHER,
        publisherWebsite: SITE_URL,
        privacyPolicyWebsite: `${SITE_URL}/privacy`,
        licenseAgreementWebsite: `${SITE_URL}/privacy`,
      }
    )

    // Fire-and-forget bulk telemetry — counts the whole pack as one event.
    void prisma.shareEvent
      .create({
        data: { stickerId: stickerRows[0].id, channel: 'whatsapp-pack' },
      })
      .catch(() => undefined)

    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    return new NextResponse(arrayBuffer as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/wastickers',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Pack build error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to build pack' },
      { status: 500 }
    )
  }
}
