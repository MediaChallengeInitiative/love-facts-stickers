// Image URL helpers.
//
// Sticker `sourceUrl` / `thumbnailUrl` are same-origin proxy URLs of the form
// `/api/image/{driveId}` (optionally `?size=NNN`). By default that route is a
// 302 *redirect* to Google's CDN — great for <img> tags, but useless for
// anything that needs to read the bytes: a cross-origin redirect makes
// `fetch()` throw on CORS, which is exactly what broke downloads (they fell
// back to opening Google Drive) and file-sharing.
//
// `toProxyBytesUrl()` flips any of our proxy URLs onto the `?proxy=1` byte
// path, which streams the image bytes back from our own origin — so
// fetch → blob works for downloads, clipboard, and Web Share File objects.

/**
 * Rewrite an `/api/image/{id}` proxy URL onto the same-origin byte path
 * (`?proxy=1`). Non-proxy/absolute URLs are returned untouched.
 *
 * @param url    the sticker sourceUrl / thumbnailUrl (e.g. `/api/image/abc?size=400`)
 * @param size   optional thumbnail width to request from the proxy
 */
export function toProxyBytesUrl(url: string, size?: number): string {
  if (!url || !url.includes('/api/image/')) return url
  const [path, query = ''] = url.split('?')
  const params = new URLSearchParams(query)
  params.set('proxy', '1')
  if (size) params.set('size', String(size))
  return `${path}?${params.toString()}`
}

/**
 * Absolute variant for server-side fetches (the WhatsApp pack builder fetches
 * its own image proxy and therefore needs a fully-qualified URL).
 */
export function toAbsoluteProxyBytesUrl(url: string, baseUrl: string, size?: number): string {
  const rel = toProxyBytesUrl(url, size)
  if (/^https?:\/\//i.test(rel)) return rel
  return `${baseUrl.replace(/\/$/, '')}${rel.startsWith('/') ? '' : '/'}${rel}`
}
