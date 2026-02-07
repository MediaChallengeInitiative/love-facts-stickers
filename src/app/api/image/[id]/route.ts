import { NextRequest, NextResponse } from 'next/server'

/**
 * Image Proxy API
 *
 * Fetches images from Google Drive and serves them with proper headers.
 * Uses Google Drive API v3 with API key as the primary method, with
 * fallback to direct URL patterns.
 *
 * Usage: /api/image/{driveFileId}
 * Optional: /api/image/{driveFileId}?size=400 for thumbnails
 */

// Cache for image responses (in-memory, resets on server restart)
const imageCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>()
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour
const MAX_CACHE_SIZE = 500

/**
 * Validate that a buffer contains actual image data by checking magic bytes
 */
function isImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 8) return false

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true
  // GIF: 47 49 46
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return true
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true
  // BMP: 42 4D
  if (buffer[0] === 0x42 && buffer[1] === 0x4D) return true
  // SVG: starts with < (3C)
  if (buffer[0] === 0x3C) return true

  return false
}

/**
 * Try to fetch an image from a URL, validating it's actually image data
 */
async function tryFetchImage(url: string, headers?: Record<string, string>): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'image/*,*/*;q=0.8',
        ...headers,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000), // 15s timeout per request
    })

    if (!response.ok) {
      console.warn(`[Image Proxy] HTTP ${response.status} from ${url.substring(0, 80)}...`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = response.headers.get('content-type') || 'image/png'

    // Validate: must be image content type AND pass magic byte check
    // This prevents serving HTML error/login pages from Google
    if (buffer.length < 100) {
      console.warn(`[Image Proxy] Response too small (${buffer.length} bytes) from ${url.substring(0, 80)}`)
      return null
    }

    if (isImageBuffer(buffer)) {
      return { buffer, contentType: contentType.includes('image') ? contentType : 'image/png' }
    }

    // If content-type says image but magic bytes don't match, still accept if large enough
    if (contentType.includes('image') && buffer.length > 1000) {
      return { buffer, contentType }
    }

    console.warn(`[Image Proxy] Non-image response (${contentType}, ${buffer.length} bytes) from ${url.substring(0, 80)}`)
    return null
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.warn(`[Image Proxy] Fetch failed for ${url.substring(0, 80)}: ${message}`)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params
    const { searchParams } = new URL(request.url)
    const size = searchParams.get('size')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    // Create cache key
    const cacheKey = `${fileId}-${size || 'full'}`

    // Check cache
    const cached = imageCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return new NextResponse(new Uint8Array(cached.data), {
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=3600, immutable',
          'X-Cache': 'HIT',
        },
      })
    }

    const apiKey = process.env.GOOGLE_API_KEY
    let result: { buffer: Buffer; contentType: string } | null = null

    // === PRIMARY METHOD: Google Drive API v3 with API key ===
    // This is the most reliable method for publicly shared Drive files
    if (apiKey) {
      const driveApiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`
      result = await tryFetchImage(driveApiUrl)

      if (result) {
        console.log(`[Image Proxy] SUCCESS via Drive API for ${fileId}`)
      } else {
        console.warn(`[Image Proxy] Drive API failed for ${fileId}, trying fallbacks...`)
      }
    } else {
      console.warn('[Image Proxy] GOOGLE_API_KEY not set - cannot use Drive API, falling back to direct URLs')
    }

    // === FALLBACK METHODS: Direct URL patterns ===
    if (!result) {
      const fallbackUrls = size
        ? [
            `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`,
            `https://lh3.googleusercontent.com/d/${fileId}=w${size}`,
            `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}-h${size}`,
          ]
        : [
            `https://lh3.googleusercontent.com/d/${fileId}`,
            `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
            `https://drive.google.com/uc?export=view&id=${fileId}`,
            `https://drive.google.com/uc?export=download&id=${fileId}`,
          ]

      const browserHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }

      for (const url of fallbackUrls) {
        result = await tryFetchImage(url, browserHeaders)
        if (result) {
          console.log(`[Image Proxy] SUCCESS via fallback URL for ${fileId}`)
          break
        }
      }
    }

    // === LAST RESORT: Try Drive API to get thumbnailLink from metadata ===
    if (!result && apiKey) {
      try {
        const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink,webContentLink&key=${apiKey}`
        const metaRes = await fetch(metaUrl, { signal: AbortSignal.timeout(10000) })
        if (metaRes.ok) {
          const meta = await metaRes.json()
          if (meta.thumbnailLink) {
            // thumbnailLink has a default size, replace with requested size
            const thumbUrl = size
              ? meta.thumbnailLink.replace(/=s\d+/, `=s${size}`)
              : meta.thumbnailLink.replace(/=s\d+/, '=s800')
            result = await tryFetchImage(thumbUrl)
            if (result) {
              console.log(`[Image Proxy] SUCCESS via thumbnailLink for ${fileId}`)
            }
          }
          if (!result && meta.webContentLink) {
            result = await tryFetchImage(meta.webContentLink)
            if (result) {
              console.log(`[Image Proxy] SUCCESS via webContentLink for ${fileId}`)
            }
          }
        }
      } catch (e) {
        console.warn(`[Image Proxy] Metadata fallback failed for ${fileId}:`, e)
      }
    }

    if (!result) {
      console.error(`[Image Proxy] ALL methods failed for fileId: ${fileId}. API key present: ${!!apiKey}`)
      // Return a placeholder SVG if all methods fail
      const placeholderSvg = `
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1e293b"/>
          <text x="50%" y="50%" text-anchor="middle" fill="#64748b" font-size="14" font-family="system-ui">
            Image unavailable
          </text>
        </svg>
      `
      return new NextResponse(placeholderSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    }

    // Store in cache
    imageCache.set(cacheKey, {
      data: result.buffer,
      contentType: result.contentType,
      timestamp: Date.now(),
    })

    // Clean old cache entries if cache is too large
    if (imageCache.size > MAX_CACHE_SIZE) {
      const now = Date.now()
      Array.from(imageCache.entries()).forEach(([key, value]) => {
        if (now - value.timestamp > CACHE_DURATION) {
          imageCache.delete(key)
        }
      })
    }

    return new NextResponse(new Uint8Array(result.buffer), {
      headers: {
        'Content-Type': result.contentType,
        'Cache-Control': 'public, max-age=3600, immutable',
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('[Image Proxy] Unhandled error:', error)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
  }
}
