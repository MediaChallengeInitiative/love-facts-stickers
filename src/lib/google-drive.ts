/**
 * Google Drive Utilities
 *
 * Provides functions to work with Google Drive files and folders.
 * For public folders, we can fetch files without authentication.
 */

// Google Drive folder ID from environment
export const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1ejvH2Dgo41jYv7V247XLQSqbHkKFbNkq'

/**
 * Generate a proxy URL for a Google Drive file
 * This uses our API proxy to avoid CORS and redirect issues
 */
export function getDriveProxyUrl(fileId: string): string {
  return `/api/image/${fileId}`
}

/**
 * Generate a proxy thumbnail URL for a Google Drive file
 * Smaller size for grid view
 */
export function getDriveProxyThumbnailUrl(fileId: string, size: number = 400): string {
  return `/api/image/${fileId}?size=${size}`
}

/**
 * Generate a direct download/view URL for a Google Drive file
 * This works for publicly shared files (fallback)
 */
export function getDriveDirectUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`
}

/**
 * Generate a thumbnail URL for a Google Drive file (fallback)
 */
export function getDriveThumbnailUrl(fileId: string, size: number = 400): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`
}

/**
 * Alternative direct URL format that sometimes works better
 */
export function getDriveEmbedUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}`
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  webContentLink?: string
  parents?: string[]
}

export interface DriveFolder {
  id: string
  name: string
}

/**
 * Fetch files from a public Google Drive folder using the API
 * Requires API key for public folder access
 */
export async function fetchDriveFiles(
  folderId: string,
  apiKey?: string
): Promise<DriveFile[]> {
  const key = apiKey || process.env.GOOGLE_API_KEY

  if (!key) {
    console.warn('No Google API key provided. Using manual file listing.')
    return []
  }

  const query = `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&key=${key}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,parents)`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Drive API error: ${response.status}`)
    }
    const data = await response.json()
    return data.files || []
  } catch (error) {
    console.error('Error fetching Drive files:', error)
    return []
  }
}

/**
 * Fetch subfolders from a Google Drive folder
 */
export async function fetchDriveFolders(
  parentFolderId: string,
  apiKey?: string
): Promise<DriveFolder[]> {
  const key = apiKey || process.env.GOOGLE_API_KEY

  if (!key) {
    return []
  }

  const query = `'${parentFolderId}' in parents and trashed = false and mimeType = 'application/vnd.google-apps.folder'`
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&key=${key}&fields=files(id,name)`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Drive API error: ${response.status}`)
    }
    const data = await response.json()
    return data.files || []
  } catch (error) {
    console.error('Error fetching Drive folders:', error)
    return []
  }
}

/**
 * Extract file ID from various Google Drive URL formats
 */
export function extractFileId(url: string): string | null {
  // Format: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileMatch) return fileMatch[1]

  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (openMatch) return openMatch[1]

  // Format: https://drive.google.com/uc?id=FILE_ID
  const ucMatch = url.match(/uc\?.*id=([a-zA-Z0-9_-]+)/)
  if (ucMatch) return ucMatch[1]

  return null
}
