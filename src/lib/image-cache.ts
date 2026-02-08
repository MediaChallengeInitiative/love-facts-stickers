/**
 * Shared image cache for the image proxy.
 * Separated from the route file so sync endpoints can clear it.
 */

export const imageCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>()

export const IMAGE_CACHE_DURATION = 1000 * 60 * 5 // 5 minutes
export const MAX_CACHE_SIZE = 500

/** Clear all cached images — call after sync to force fresh fetches */
export function clearImageCache() {
  imageCache.clear()
  console.log('[Image Cache] Cleared')
}

/** Remove expired entries if cache exceeds max size */
export function pruneImageCache() {
  if (imageCache.size > MAX_CACHE_SIZE) {
    const now = Date.now()
    Array.from(imageCache.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > IMAGE_CACHE_DURATION) {
        imageCache.delete(key)
      }
    })
  }
}
