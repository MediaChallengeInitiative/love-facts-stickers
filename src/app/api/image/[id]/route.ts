import { NextRequest, NextResponse } from 'next/server'

/**
 * Image Proxy API
 *
 * Fetches images from Google Drive and serves them with proper headers.
 * Uses multiple fetch strategies with retry logic to maximize reliability.
 *
 * Usage: /api/image/{driveFileId}
 * Optional: /api/image/{driveFileId}?size=400 for thumbnails
 */

// Cache for image responses (in-memory, resets on server restart)
const imageCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>()
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour
const MAX_CACHE_SIZE = 500
const FETCH_TIMEOUT = 30000 // 30s timeout per request
const MAX_RETRIES = 2

/**
 * Validate that a buffer contains actual image data by checking magic bytes
 */
function isImageBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true
  // GIF: 47 49 46
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return true
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true
  // BMP: 42 4D
  if (buffer[0] === 0x42 && buffer[1] === 0x4D) return true
  // SVG: starts with < (3C) or whitespace then <
  if (buffer[0] === 0x3C) return true
  // TIFF: 49 49 or 4D 4D
  if ((buffer[0] === 0x49 && buffer[1] === 0x49) || (buffer[0] === 0x4D && buffer[1] === 0x4D)) return true
  // ICO: 00 00 01 00
  if (buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00) return true

  return false
}

/**
 * Check if response is an HTML page (Google login/consent/virus scan page)
 */
function isHtmlResponse(buffer: Buffer, contentType: string): boolean {
  if (contentType.includes('text/html')) return true
  const start = buffer.subarray(0, 500).toString('utf-8').trim().toLowerCase()
  return start.startsWith('<!doctype') || start.startsWith('<html')
}

/**
 * Extract the confirm download URL from Google's virus scan warning page
 */
function extractConfirmUrl(html: string, fileId: string): string | null {
  // Look for confirmation form action or download link
  const confirmMatch = html.match(/confirm=([0-9A-Za-z_-]+)/)
  if (confirmMatch) {
    return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmMatch[1]}`
  }
  // Look for direct download link in the HTML
  const hrefMatch = html.match(/href="(\/uc\?export=download[^"]+)"/)
  if (hrefMatch) {
    return `https://drive.google.com${hrefMatch[1].replace(/&amp;/g, '&')}`
  }
  return null
}

/**
 * Try to fetch an image from a URL, validating it's actually image data
 */
async function tryFetchImage(
  url: string,
  headers?: Record<string, string>,
  fileId?: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'image/*,*/*;q=0.8',
        ...headers,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    })

    if (!response.ok) {
      console.warn(`[Image Proxy] HTTP ${response.status} from ${url.substring(0, 100)}`)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = response.headers.get('content-type') || 'image/png'

    // Check for Google's HTML virus scan / consent pages
    if (isHtmlResponse(buffer, contentType) && fileId) {
      const html = buffer.toString('utf-8')
      const confirmUrl = extractConfirmUrl(html, fileId)
      if (confirmUrl) {
        console.log(`[Image Proxy] Following virus scan confirmation for ${fileId}`)
        return tryFetchImage(confirmUrl, headers)
      }
      console.warn(`[Image Proxy] Got HTML page (not image) from ${url.substring(0, 100)}`)
      return null
    }

    // Reject very small responses (likely error messages)
    if (buffer.length < 50) {
      console.warn(`[Image Proxy] Response too small (${buffer.length} bytes) from ${url.substring(0, 100)}`)
      return null
    }

    // Best case: magic bytes confirm it's an image
    if (isImageBuffer(buffer)) {
      return { buffer, contentType: contentType.includes('image') ? contentType : 'image/png' }
    }

    // Accept if content-type says image and the data is reasonably sized
    if (contentType.includes('image') && buffer.length > 500) {
      return { buffer, contentType }
    }

    // Accept if content-type is octet-stream and data is large enough (likely a binary image)
    if (contentType.includes('octet-stream') && buffer.length > 1000) {
      return { buffer, contentType: 'image/png' }
    }

    console.warn(`[Image Proxy] Non-image response (${contentType}, ${buffer.length} bytes) from ${url.substring(0, 100)}`)
    return null
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.warn(`[Image Proxy] Fetch failed for ${url.substring(0, 100)}: ${message}`)
    return null
  }
}

/**
 * Try a fetch with retries
 */
async function tryFetchWithRetry(
  url: string,
  headers?: Record<string, string>,
  fileId?: string,
  retries: number = MAX_RETRIES,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await tryFetchImage(url, headers, fileId)
    if (result) return result
    if (attempt < retries) {
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)))
    }
  }
  return null
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

    const browserHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Referer': 'https://drive.google.com/',
    }

    // === STRATEGY 1: Google Drive API v3 with API key (most reliable for public files) ===
    if (apiKey) {
      const driveApiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`
      result = await tryFetchWithRetry(driveApiUrl, undefined, fileId)

      if (result) {
        console.log(`[Image Proxy] SUCCESS via Drive API for ${fileId}`)
      }
    }

    // === STRATEGY 2: Google Drive thumbnail endpoint (very reliable, works for shared files) ===
    if (!result) {
      const thumbSize = size || '800'
      const thumbnailUrls = [
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w${thumbSize}`,
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w${thumbSize}-h${thumbSize}`,
      ]

      for (const url of thumbnailUrls) {
        result = await tryFetchWithRetry(url, browserHeaders, fileId, 1)
        if (result) {
          console.log(`[Image Proxy] SUCCESS via thumbnail endpoint for ${fileId}`)
          break
        }
      }
    }

    // === STRATEGY 3: lh3.googleusercontent.com direct URL ===
    if (!result) {
      const lh3Urls = size
        ? [
            `https://lh3.googleusercontent.com/d/${fileId}=w${size}`,
            `https://lh3.googleusercontent.com/d/${fileId}=s${size}`,
          ]
        : [
            `https://lh3.googleusercontent.com/d/${fileId}=w800`,
            `https://lh3.googleusercontent.com/d/${fileId}`,
          ]

      for (const url of lh3Urls) {
        result = await tryFetchImage(url, browserHeaders, fileId)
        if (result) {
          console.log(`[Image Proxy] SUCCESS via lh3 URL for ${fileId}`)
          break
        }
      }
    }

    // === STRATEGY 4: Drive export/view URLs ===
    if (!result) {
      const exportUrls = [
        `https://drive.google.com/uc?export=view&id=${fileId}`,
        `https://drive.google.com/uc?export=download&id=${fileId}`,
      ]

      for (const url of exportUrls) {
        result = await tryFetchImage(url, browserHeaders, fileId)
        if (result) {
          console.log(`[Image Proxy] SUCCESS via export URL for ${fileId}`)
          break
        }
      }
    }

    // === STRATEGY 5: Use Drive API to get thumbnailLink/webContentLink from metadata ===
    if (!result && apiKey) {
      try {
        const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink,webContentLink,mimeType&key=${apiKey}`
        const metaRes = await fetch(metaUrl, { signal: AbortSignal.timeout(15000) })
        if (metaRes.ok) {
          const meta = await metaRes.json()

          if (meta.thumbnailLink) {
            // thumbnailLink has a default size, replace with requested size
            const thumbUrl = size
              ? meta.thumbnailLink.replace(/=s\d+/, `=s${size}`)
              : meta.thumbnailLink.replace(/=s\d+/, '=s800')
            result = await tryFetchImage(thumbUrl, undefined, fileId)
            if (result) {
              console.log(`[Image Proxy] SUCCESS via metadata thumbnailLink for ${fileId}`)
            }
          }

          if (!result && meta.webContentLink) {
            result = await tryFetchImage(meta.webContentLink, browserHeaders, fileId)
            if (result) {
              console.log(`[Image Proxy] SUCCESS via metadata webContentLink for ${fileId}`)
            }
          }
        }
      } catch (e) {
        console.warn(`[Image Proxy] Metadata fallback failed for ${fileId}:`, e)
      }
    }

    // === STRATEGY 6: Service account token if available ===
    if (!result && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      try {
        const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
        // Use JWT to get an access token from service account
        const jwt = await createServiceAccountJWT(serviceAccountKey)
        if (jwt) {
          const saUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
          result = await tryFetchImage(saUrl, {
            'Authorization': `Bearer ${jwt}`,
          }, fileId)
          if (result) {
            console.log(`[Image Proxy] SUCCESS via service account for ${fileId}`)
          }
        }
      } catch (e) {
        console.warn(`[Image Proxy] Service account fallback failed for ${fileId}:`, e)
      }
    }

    if (!result) {
      console.error(`[Image Proxy] ALL methods failed for fileId: ${fileId}. API key present: ${!!apiKey}`)
      // Return a placeholder SVG if all methods fail
      const placeholderSvg = `
        <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#1e293b"/>
          <text x="50%" y="45%" text-anchor="middle" fill="#64748b" font-size="14" font-family="system-ui">
            Image unavailable
          </text>
          <text x="50%" y="55%" text-anchor="middle" fill="#475569" font-size="11" font-family="system-ui">
            Please try refreshing
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

/**
 * Create a JWT access token from a Google service account key.
 * This is a minimal implementation that avoids importing the full googleapis library.
 */
async function createServiceAccountJWT(
  serviceAccountKey: { client_email: string; private_key: string }
): Promise<string | null> {
  try {
    const now = Math.floor(Date.now() / 1000)
    const header = { alg: 'RS256', typ: 'JWT' }
    const payload = {
      iss: serviceAccountKey.client_email,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }

    const encode = (obj: object) =>
      Buffer.from(JSON.stringify(obj)).toString('base64url')

    const unsignedToken = `${encode(header)}.${encode(payload)}`

    // Import the private key and sign
    const crypto = await import('crypto')
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(unsignedToken)
    const signature = sign.sign(serviceAccountKey.private_key, 'base64url')

    const jwt = `${unsignedToken}.${signature}`

    // Exchange JWT for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
      signal: AbortSignal.timeout(10000),
    })

    if (tokenRes.ok) {
      const tokenData = await tokenRes.json()
      return tokenData.access_token
    }

    console.warn('[Image Proxy] Service account token exchange failed:', tokenRes.status)
    return null
  } catch (e) {
    console.warn('[Image Proxy] Service account JWT creation failed:', e)
    return null
  }
}
