import { NextRequest, NextResponse } from 'next/server'

/**
 * Image Proxy API
 *
 * Fetches images from Google Drive and serves them with proper headers.
 * This solves CORS issues and redirect problems with direct Google Drive URLs.
 *
 * Usage: /api/image/{driveFileId}
 * Optional: /api/image/{driveFileId}?size=400 for thumbnails
 */

// Cache for image responses (in-memory, resets on server restart)
const imageCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>()
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour

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

    // Try multiple URL formats to find one that works
    const urls = size
      ? [
          // Thumbnail URLs
          `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`,
          `https://lh3.googleusercontent.com/d/${fileId}=w${size}`,
        ]
      : [
          // Full-size URLs
          `https://lh3.googleusercontent.com/d/${fileId}`,
          `https://drive.google.com/uc?export=view&id=${fileId}`,
          `https://drive.google.com/uc?export=download&id=${fileId}`,
        ]

    let imageBuffer: Buffer | null = null
    let contentType = 'image/png'

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/*,*/*;q=0.8',
          },
          redirect: 'follow',
        })

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          imageBuffer = Buffer.from(arrayBuffer)
          contentType = response.headers.get('content-type') || 'image/png'

          // Verify it's actually an image (not an HTML error page)
          if (contentType.includes('image') && imageBuffer.length > 1000) {
            break
          } else {
            imageBuffer = null
          }
        }
      } catch (e) {
        console.warn(`Failed to fetch from ${url}:`, e)
        continue
      }
    }

    if (!imageBuffer) {
      // Return a placeholder SVG if image fetch fails
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
          'Cache-Control': 'public, max-age=60',
        },
      })
    }

    // Store in cache
    imageCache.set(cacheKey, {
      data: imageBuffer,
      contentType,
      timestamp: Date.now(),
    })

    // Clean old cache entries
    if (imageCache.size > 500) {
      const now = Date.now()
      Array.from(imageCache.entries()).forEach(([key, value]) => {
        if (now - value.timestamp > CACHE_DURATION) {
          imageCache.delete(key)
        }
      })
    }

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, immutable',
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
  }
}
