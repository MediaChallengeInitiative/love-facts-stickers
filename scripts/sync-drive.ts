/**
 * Google Drive to S3 Sync Script
 *
 * This script syncs stickers from Google Drive to AWS S3 and updates the database.
 *
 * Usage:
 *   npx ts-node scripts/sync-drive.ts
 *
 * Environment variables required:
 *   - GOOGLE_CLIENT_ID
 *   - GOOGLE_CLIENT_SECRET
 *   - GOOGLE_DRIVE_FOLDER_ID
 *   - AWS_ACCESS_KEY_ID
 *   - AWS_SECRET_ACCESS_KEY
 *   - S3_BUCKET_NAME
 *   - DATABASE_URL
 */

import { google } from 'googleapis'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { PrismaClient } from '@prisma/client'
import * as path from 'path'
import * as fs from 'fs'

// Initialize clients
const prisma = new PrismaClient()

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'love-facts-stickers'
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1ejvH2Dgo41jYv7V247XLQSqbHkKFbNkq'

// Collection name mappings
const COLLECTION_METADATA: Record<string, { slug: string; description: string; sortOrder: number }> = {
  'Call out Lies in a Fun Way': {
    slug: 'call-out-lies',
    description: 'Fun and creative stickers to call out misinformation with humor',
    sortOrder: 1,
  },
  'Kickstart Conversations': {
    slug: 'kickstart-conversations',
    description: 'Start meaningful discussions about media literacy',
    sortOrder: 2,
  },
  'Respond to Misinformation': {
    slug: 'respond-to-misinformation',
    description: 'Quick responses to counter false information',
    sortOrder: 3,
  },
  'Shift the Vibe': {
    slug: 'shift-the-vibe',
    description: 'Lighten the mood while spreading truth',
    sortOrder: 4,
  },
  'Make the Truth Go Viral': {
    slug: 'make-truth-viral',
    description: 'Shareable stickers to amplify accurate information',
    sortOrder: 5,
  },
}

async function getGoogleDriveClient() {
  // For service account authentication
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  })

  return google.drive({ version: 'v3', auth })
}

async function listDriveFolders(drive: ReturnType<typeof google.drive>, parentFolderId: string) {
  const response = await drive.files.list({
    q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
  })

  return response.data.files || []
}

async function listDriveFiles(drive: ReturnType<typeof google.drive>, folderId: string) {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed = false`,
    fields: 'files(id, name, mimeType, size, imageMediaMetadata)',
  })

  return response.data.files || []
}

async function downloadDriveFile(drive: ReturnType<typeof google.drive>, fileId: string): Promise<Buffer> {
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  )

  return Buffer.from(response.data as ArrayBuffer)
}

async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  // Check if file already exists
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: key }))
    console.log(`  File already exists in S3: ${key}`)
    return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
  } catch (error) {
    // File doesn't exist, upload it
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read',
    })
  )

  console.log(`  Uploaded to S3: ${key}`)
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
}

function generateTags(filename: string, collectionName: string): string[] {
  const tags: string[] = []

  // Add collection-based tags
  const collectionWords = collectionName.toLowerCase().split(' ')
  tags.push(...collectionWords.filter((w) => w.length > 3))

  // Add filename-based tags
  const nameWithoutExt = path.parse(filename).name
  const nameWords = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 2)
  tags.push(...nameWords.map((w) => w.toLowerCase()))

  // Deduplicate
  return Array.from(new Set(tags))
}

async function syncDriveToS3() {
  console.log('Starting Google Drive to S3 sync...\n')

  const startTime = Date.now()
  let itemsSynced = 0
  let errors: string[] = []

  // Create sync log
  const syncLog = await prisma.syncLog.create({
    data: {
      status: 'started',
      syncType: 'full',
    },
  })

  try {
    const drive = await getGoogleDriveClient()

    // List collection folders
    console.log('Fetching collection folders from Google Drive...')
    const folders = await listDriveFolders(drive, DRIVE_FOLDER_ID)
    console.log(`Found ${folders.length} collection folders\n`)

    for (const folder of folders) {
      const folderName = folder.name!
      const folderId = folder.id!

      console.log(`\nProcessing collection: ${folderName}`)

      // Get or create collection in database
      const metadata = COLLECTION_METADATA[folderName] || {
        slug: folderName.toLowerCase().replace(/\s+/g, '-'),
        description: '',
        sortOrder: 99,
      }

      let collection = await prisma.collection.findUnique({
        where: { driveFolderId: folderId },
      })

      if (!collection) {
        collection = await prisma.collection.create({
          data: {
            name: folderName,
            slug: metadata.slug,
            description: metadata.description,
            driveFolderId: folderId,
            sortOrder: metadata.sortOrder,
          },
        })
        console.log(`  Created collection: ${folderName}`)
      }

      // List files in folder
      const files = await listDriveFiles(drive, folderId)
      console.log(`  Found ${files.length} stickers`)

      for (const file of files) {
        const fileName = file.name!
        const fileId = file.id!
        const mimeType = file.mimeType!

        console.log(`  Processing: ${fileName}`)

        // Check if sticker already exists
        const existingSticker = await prisma.sticker.findUnique({
          where: { driveId: fileId },
        })

        if (existingSticker) {
          console.log(`    Already synced, skipping...`)
          continue
        }

        try {
          // Download from Drive
          const fileBuffer = await downloadDriveFile(drive, fileId)

          // Upload to S3
          const s3Key = `stickers/${metadata.slug}/${fileName}`
          const s3Url = await uploadToS3(s3Key, fileBuffer, mimeType)

          // Create thumbnail (for now, use same URL - in production use image processing)
          const thumbnailUrl = s3Url

          // Generate tags
          const tags = generateTags(fileName, folderName)

          // Create sticker in database
          await prisma.sticker.create({
            data: {
              title: path.parse(fileName).name.replace(/[-_]/g, ' '),
              filename: fileName,
              sourceUrl: s3Url,
              thumbnailUrl,
              driveId: fileId,
              tags,
              collectionId: collection.id,
              width: file.imageMediaMetadata?.width || null,
              height: file.imageMediaMetadata?.height || null,
              fileSize: file.size ? parseInt(file.size) : null,
            },
          })

          itemsSynced++
          console.log(`    Synced successfully!`)
        } catch (error) {
          const errorMsg = `Failed to sync ${fileName}: ${error}`
          errors.push(errorMsg)
          console.error(`    ${errorMsg}`)
        }
      }
    }

    // Update sync log
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'completed',
        itemsSynced,
        errors: errors.length > 0 ? errors.join('\n') : null,
        completedAt: new Date(),
      },
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`\n✅ Sync completed in ${duration}s`)
    console.log(`   Items synced: ${itemsSynced}`)
    console.log(`   Errors: ${errors.length}`)
  } catch (error) {
    console.error('\n❌ Sync failed:', error)

    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: 'failed',
        itemsSynced,
        errors: String(error),
        completedAt: new Date(),
      },
    })

    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the sync
syncDriveToS3()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
