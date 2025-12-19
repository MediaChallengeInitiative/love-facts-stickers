/**
 * URL generation utilities for consistent link creation
 */

export function getBaseUrl(): string {
  // Server-side: Use environment variable
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://stickers.lovefacts.africa'
  }
  
  // Client-side: Use window.location
  const protocol = window.location.protocol
  const host = window.location.host
  return `${protocol}//${host}`
}

export function getStickerShareUrl(stickerId: string): string {
  return `${getBaseUrl()}/sticker/${stickerId}`
}

export function getCollectionUrl(collectionSlug: string): string {
  return `${getBaseUrl()}/?collection=${collectionSlug}`
}

export function getDownloadUrl(stickerId: string): string {
  return `${getBaseUrl()}/api/download/${stickerId}`
}