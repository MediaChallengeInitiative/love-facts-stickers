/**
 * Database Seed Script
 *
 * Seeds the database with sample collections and stickers for development.
 *
 * Usage:
 *   npx ts-node scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const COLLECTIONS = [
  {
    name: 'Call out Lies in a Fun Way',
    slug: 'call-out-lies',
    description: 'Fun and creative stickers to call out misinformation with humor',
    sortOrder: 1,
  },
  {
    name: 'Kickstart Conversations',
    slug: 'kickstart-conversations',
    description: 'Start meaningful discussions about media literacy',
    sortOrder: 2,
  },
  {
    name: 'Respond to Misinformation',
    slug: 'respond-to-misinformation',
    description: 'Quick responses to counter false information',
    sortOrder: 3,
  },
  {
    name: 'Shift the Vibe',
    slug: 'shift-the-vibe',
    description: 'Lighten the mood while spreading truth',
    sortOrder: 4,
  },
  {
    name: 'Make the Truth Go Viral',
    slug: 'make-truth-viral',
    description: 'Shareable stickers to amplify accurate information',
    sortOrder: 5,
  },
]

const SAMPLE_STICKERS = [
  { title: 'Fact Check First', tags: ['fact-check', 'verify', 'truth'], collection: 0 },
  { title: 'Source Please', tags: ['source', 'citation', 'proof'], collection: 0 },
  { title: 'Is This Real', tags: ['question', 'verify', 'doubt'], collection: 0 },
  { title: 'Think Before You Share', tags: ['think', 'share', 'responsible'], collection: 1 },
  { title: 'Lets Talk Facts', tags: ['conversation', 'facts', 'discuss'], collection: 1 },
  { title: 'Check Your Sources', tags: ['source', 'check', 'verify'], collection: 1 },
  { title: 'Fake News Alert', tags: ['fake', 'news', 'alert'], collection: 2 },
  { title: 'Not Today Fake News', tags: ['fake', 'response', 'counter'], collection: 2 },
  { title: 'Citation Needed', tags: ['citation', 'proof', 'evidence'], collection: 2 },
  { title: 'Keep Calm and Verify', tags: ['calm', 'verify', 'peace'], collection: 3 },
  { title: 'Truth Vibes Only', tags: ['truth', 'vibes', 'positive'], collection: 3 },
  { title: 'Good Info Energy', tags: ['energy', 'positive', 'info'], collection: 3 },
  { title: 'Love Facts', tags: ['love', 'facts', 'truth'], collection: 4 },
  { title: 'Share the Truth', tags: ['share', 'truth', 'viral'], collection: 4 },
  { title: 'Truth is Trending', tags: ['trending', 'truth', 'viral'], collection: 4 },
]

async function main() {
  console.log('🌱 Starting database seed...\n')

  // Create collections
  console.log('Creating collections...')
  const createdCollections = []

  for (const collectionData of COLLECTIONS) {
    const collection = await prisma.collection.upsert({
      where: { slug: collectionData.slug },
      update: {},
      create: collectionData,
    })
    createdCollections.push(collection)
    console.log(`  ✓ ${collection.name}`)
  }

  // Create sample stickers
  console.log('\nCreating sample stickers...')

  for (const stickerData of SAMPLE_STICKERS) {
    const collection = createdCollections[stickerData.collection]
    const filename = `${stickerData.title.toLowerCase().replace(/\s+/g, '-')}.png`

    await prisma.sticker.upsert({
      where: {
        id: `seed-${stickerData.title.toLowerCase().replace(/\s+/g, '-')}`,
      },
      update: {},
      create: {
        id: `seed-${stickerData.title.toLowerCase().replace(/\s+/g, '-')}`,
        title: stickerData.title,
        filename,
        sourceUrl: `/stickers/${filename}`,
        thumbnailUrl: `/stickers/${filename}`,
        tags: stickerData.tags,
        caption: `${stickerData.title} - Share to spread media literacy!`,
        collectionId: collection.id,
      },
    })
    console.log(`  ✓ ${stickerData.title}`)
  }

  // Create admin user
  console.log('\nCreating admin user...')
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lovefacts.org'
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123'

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      passwordHash: hashedPassword,
      role: 'super_admin',
    },
  })
  console.log(`  ✓ Admin user created: ${adminEmail}`)

  console.log('\n✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
