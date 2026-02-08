import { google, drive_v3 } from 'googleapis'
import prisma from '@/lib/db'
import { getDriveProxyUrl, getDriveProxyThumbnailUrl } from './google-drive'
import { createOAuth2Client, setCredentials } from './google-auth'
import { setSyncState, getSyncState, retryWithBackoff } from './sync-utils'

interface DriveChange {
  fileId?: string | null
  removed?: boolean
  file?: drive_v3.Schema$File
  changeType?: string | null
  type?: string | null
}

/**
 * Google Drive Sync Engine with Changes API
 */
export class DriveSyncEngine {
  private drive: drive_v3.Drive
  private pageToken: string | null = null

  constructor(accessToken?: string) {
    const auth = createOAuth2Client()
    
    if (accessToken) {
      setCredentials(auth, { access_token: accessToken })
    }
    
    this.drive = google.drive({ version: 'v3', auth })
  }

  /**
   * Initialize or retrieve the saved page token for incremental sync
   */
  async initializePageToken(): Promise<string> {
    // Try to get saved token from database
    const savedToken = await getSyncState('drive_page_token')
    if (savedToken) {
      return savedToken
    }

    // Get a new start page token
    const response = await retryWithBackoff(
      () => this.drive.changes.getStartPageToken(),
      3,
      1000
    )
    
    if (!response.data.startPageToken) {
      throw new Error('Failed to get start page token from Google Drive')
    }
    
    const token = response.data.startPageToken
    await setSyncState('drive_page_token', token)
    return token
  }

  /**
   * Watch for changes using the Changes API
   */
  async watchChanges(pageToken: string): Promise<{
    changes: DriveChange[]
    nextPageToken: string | null
  }> {
    try {
      const response = await this.drive.changes.list({
        pageToken,
        includeItemsFromAllDrives: false,
        supportsAllDrives: false,
        fields: 'nextPageToken,changes(fileId,removed,file(id,name,mimeType,parents,trashed),changeType,type)'
      })

      return {
        changes: (response.data.changes || []) as DriveChange[],
        nextPageToken: response.data.nextPageToken || null
      }
    } catch (error) {
      console.error('Error watching changes:', error)
      throw error
    }
  }

  /**
   * Process a batch of changes
   */
  async processChanges(changes: DriveChange[]): Promise<{
    processed: number
    errors: string[]
  }> {
    let processed = 0
    const errors: string[] = []
    const batchSize = 10 // Process in batches to avoid rate limits

    for (let i = 0; i < changes.length; i += batchSize) {
      const batch = changes.slice(i, i + batchSize)
      
      await Promise.all(batch.map(async (change) => {
        try {
          if (!change.fileId) return

          if (change.removed || change.file?.trashed) {
            // Handle file deletion
            await this.handleFileRemoval(change.fileId)
          } else if (change.file) {
            // Handle file addition or update
            await this.handleFileUpdate(change.file)
          }

          processed++
        } catch (error) {
          errors.push(`Error processing change for file ${change.fileId}: ${error}`)
        }
      }))
      
      // Small delay between batches to respect rate limits
      if (i + batchSize < changes.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return { processed, errors }
  }

  /**
   * Handle file removal/deletion
   */
  private async handleFileRemoval(fileId: string): Promise<void> {
    // Remove sticker if it exists
    const sticker = await prisma.sticker.findUnique({
      where: { driveId: fileId }
    })

    if (sticker) {
      await prisma.sticker.delete({
        where: { id: sticker.id }
      })
      console.log(`Removed sticker: ${sticker.title}`)
    }

    // Check if it's a folder
    const collection = await prisma.collection.findUnique({
      where: { driveFolderId: fileId }
    })

    if (collection) {
      // Remove collection and all its stickers
      await prisma.sticker.deleteMany({
        where: { collectionId: collection.id }
      })
      await prisma.collection.delete({
        where: { id: collection.id }
      })
      console.log(`Removed collection: ${collection.name}`)
    }
  }

  /**
   * Handle file addition or update
   */
  private async handleFileUpdate(file: drive_v3.Schema$File): Promise<void> {
    if (!file.id) return

    // Check if it's a folder
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      await this.syncFolder(file)
    } 
    // Check if it's an image
    else if (file.mimeType?.startsWith('image/')) {
      await this.syncImage(file)
    }
  }

  /**
   * Sync a folder (collection) — handles both new folders and renames
   */
  private async syncFolder(folder: drive_v3.Schema$File): Promise<void> {
    if (!folder.id || !folder.name) return

    const newSlug = folder.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Check for rename
    const existing = await prisma.collection.findUnique({
      where: { driveFolderId: folder.id },
      select: { name: true, slug: true }
    })

    const isRename = existing && existing.name !== folder.name

    // If renaming, check if the new slug conflicts with another collection
    if (isRename) {
      const slugConflict = await prisma.collection.findUnique({ where: { slug: newSlug } })
      const finalSlug = slugConflict && slugConflict.driveFolderId !== folder.id
        ? `${newSlug}-${folder.id.substring(0, 6)}`
        : newSlug

      await prisma.collection.update({
        where: { driveFolderId: folder.id },
        data: {
          name: folder.name,
          slug: finalSlug,
          description: `${folder.name} stickers`,
        }
      })
      console.log(`Renamed collection: "${existing.name}" → "${folder.name}"`)
    } else {
      await prisma.collection.upsert({
        where: { driveFolderId: folder.id },
        update: {
          name: folder.name,
        },
        create: {
          name: folder.name,
          slug: newSlug,
          driveFolderId: folder.id,
          description: `${folder.name} stickers`,
        }
      })
      console.log(`Synced collection: ${folder.name}`)
    }
  }

  /**
   * Sync an image file (sticker) — handles both new files and renames
   */
  private async syncImage(file: drive_v3.Schema$File): Promise<void> {
    if (!file.id || !file.name || !file.parents) return

    // Find the collection
    const collection = await prisma.collection.findUnique({
      where: { driveFolderId: file.parents[0] }
    })

    if (!collection) {
      console.warn(`No collection found for file parent: ${file.parents[0]}`)
      return
    }

    const title = file.name.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '').replace(/[-_]/g, ' ')
    const newTags = this.generateTags(title)

    // Check if this is a rename (existing sticker with different filename)
    const existing = await prisma.sticker.findUnique({
      where: { driveId: file.id },
      select: { filename: true, title: true }
    })

    const isRename = existing && existing.filename !== file.name

    await prisma.sticker.upsert({
      where: { driveId: file.id },
      update: {
        title,
        filename: file.name,
        sourceUrl: getDriveProxyUrl(file.id),
        thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
        collectionId: collection.id,
        // Always update tags and caption on rename so they reflect the new name
        tags: newTags,
        caption: `${title} - Share to spread media literacy!`,
      },
      create: {
        title,
        filename: file.name,
        driveId: file.id,
        sourceUrl: getDriveProxyUrl(file.id),
        thumbnailUrl: getDriveProxyThumbnailUrl(file.id),
        collectionId: collection.id,
        tags: newTags,
        caption: `${title} - Share to spread media literacy!`,
      }
    })

    if (isRename) {
      console.log(`Renamed sticker: "${existing.title}" → "${title}"`)
    } else {
      console.log(`Synced sticker: ${title}`)
    }
  }

  /**
   * Generate tags from title
   */
  private generateTags(title: string): string[] {
    const words = title.toLowerCase().split(/\s+/)
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    return words
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 5)
  }

  /**
   * Set up webhook for push notifications
   */
  async setupWebhook(webhookUrl: string, channelId: string): Promise<void> {
    try {
      await this.drive.changes.watch({
        pageToken: await this.initializePageToken(),
        requestBody: {
          id: channelId,
          type: 'web_hook',
          address: webhookUrl,
          expiration: String(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      })

      console.log('Webhook registered successfully')
    } catch (error) {
      console.error('Error setting up webhook:', error)
      throw error
    }
  }
}