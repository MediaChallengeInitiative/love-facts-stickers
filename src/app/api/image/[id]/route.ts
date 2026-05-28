import { NextRequest, NextResponse } from 'next/server'
import { imageCache, IMAGE_CACHE_DURATION, pruneImageCache } from '@/lib/image-cache'

/**
 * Image proxy for Google Drive stickers.
 *
 * v2 fast path: 302 redirect straight to `drive.google.com/thumbnail`. That
 * endpoint is itself a 302 to `lh3.googleusercontent.com` (Google's CDN),
 * returns in milliseconds, and is the only path that consistently works for
 * the files we sync — the v3 Drive API rejects our key with 403 for these
 * files, so the old "try the API first, fall back to thumbnail" flow burned
 * 30 seconds per image on every cache miss.
 *
 * Slow fallback (?proxy=1): server-side fetch with the previous multi-strategy
 * pipeline + in-process buffer cache. Reserved for cases where the client
 * can't follow cross-origin redirects (e.g. server-side rendering of OG cards,
 * the WhatsApp pack builder). The pipeline now bails after the first 403 from
 * the Drive API instead of retrying.
 */

const FETCH_TIMEOUT = 15000

// Module-scoped: once we see a 403 from the Drive API in this process, stop
// trying that strategy for the lifetime of the process.
let driveApiKeyKnownBad = false

// In-flight dedup so 50 concurrent grid cells for the same fileId don't all
// trigger separate fetches.
const inFlight = new Map<string, Promise<{ buffer: Buffer; contentType: string } | null>>()

function buildThumbnailUrl(fileId: string, size: string): string {
  const sz = size || '400'
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${sz}`
}

function isImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return true
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  )
    return true
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) return true
  return false
}

async function tryFetch(
  url: string,
  headers?: Record<string, string>
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'image/*,*/*;q=0.8', ...headers },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    })
    if (!res.ok) return null
    const ab = await res.arrayBuffer()
    const buf = Buffer.from(ab)
    const ct = res.headers.get('content-type') || 'image/png'
    if (buf.length < 50) return null
    if (isImageBuffer(buf)) return { buffer: buf, contentType: ct.includes('image') ? ct : 'image/png' }
    if (ct.includes('image') && buf.length > 500) return { buffer: buf, contentType: ct }
    return null
  } catch {
    return null
  }
}

async function proxyFetch(fileId: string, size: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const existing = inFlight.get(fileId)
  if (existing) return existing

  const job = (async () => {
    const browserHeaders = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Referer: 'https://drive.google.com/',
    }

    // 1) Thumbnail endpoint — most reliable in practice
    const thumbResult = await tryFetch(buildThumbnailUrl(fileId, size), browserHeaders)
    if (thumbResult) return thumbResult

    // 2) lh3 direct — same CDN backend, sometimes works when thumbnail doesn't
    const lh3Result = await tryFetch(`https://lh3.googleusercontent.com/d/${fileId}=w${size || '800'}`, browserHeaders)
    if (lh3Result) return lh3Result

    // 3) Drive API — only if we haven't seen a 403 yet
    if (!driveApiKeyKnownBad && process.env.GOOGLE_API_KEY) {
      const apiRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${process.env.GOOGLE_API_KEY}`,
        { signal: AbortSignal.timeout(FETCH_TIMEOUT) }
      ).catch(() => null)
      if (apiRes?.status === 403) {
        driveApiKeyKnownBad = true
        console.warn('[Image Proxy] Drive API returned 403 — disabling that strategy for this process')
      } else if (apiRes?.ok) {
        const ab = await apiRes.arrayBuffer()
        const buf = Buffer.from(ab)
        if (isImageBuffer(buf)) {
          return { buffer: buf, contentType: apiRes.headers.get('content-type') || 'image/png' }
        }
      }
    }

    return null
  })()

  inFlight.set(fileId, job)
  try {
    return await job
  } finally {
    inFlight.delete(fileId)
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: fileId } = await params
  const { searchParams } = new URL(request.url)
  const size = searchParams.get('size') || '400'
  const wantsProxy = searchParams.get('proxy') === '1'

  if (!fileId) {
    return NextResponse.json({ error: 'File ID required' }, { status: 400 })
  }

  // ─── Fast path: redirect to Drive's thumbnail endpoint ───────────────
  // Browsers follow the redirect (which itself 302s to lh3.googleusercontent.com),
  // and Google's CDN serves the image in milliseconds. No server-side fetch.
  if (!wantsProxy) {
    return NextResponse.redirect(buildThumbnailUrl(fileId, size), {
      status: 302,
      headers: {
        // Allow CDNs (Vercel etc.) to cache the redirect itself for an hour.
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    })
  }

  // ─── Slow path: server-side proxy (?proxy=1) ─────────────────────────
  const cacheKey = `${fileId}-${size}`
  const cached = imageCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < IMAGE_CACHE_DURATION) {
    return new NextResponse(new Uint8Array(cached.data), {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        'X-Cache': 'HIT',
      },
    })
  }

  const result = await proxyFetch(fileId, size)
  if (!result) {
    const placeholder = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#1e293b"/><text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-size="14" font-family="system-ui">Image unavailable</text></svg>`
    return new NextResponse(placeholder, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' },
    })
  }

  imageCache.set(cacheKey, { data: result.buffer, contentType: result.contentType, timestamp: Date.now() })
  pruneImageCache()

  return new NextResponse(new Uint8Array(result.buffer), {
    headers: {
      'Content-Type': result.contentType,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Cache': 'MISS',
    },
  })
}
