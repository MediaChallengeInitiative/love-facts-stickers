/**
 * Database Seed Script (v2)
 *
 * Seeds the database with demo-able content that exercises every v2 feature:
 *  - 6 collections, one tagged RED_FLAGS so /red-flags has content
 *  - 36 stickers (6 per collection) with placeholder.co brand-coloured images
 *  - 10 stickers marked as heroes (isHero, heroRank 1..10) so the Spotlight
 *    section renders the curated lane
 *  - Realistic shareCount / viewCount / usefulCount so the "most-shared"
 *    fallback in the spotlight ranks correctly and badges surface
 *
 * Idempotent — re-running upserts everything on slug/id.
 *
 * Usage:
 *   npx ts-node scripts/seed.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

type CollectionSeed = {
  name: string
  slug: string
  description: string
  sortOrder: number
  category: 'LOVE_FACTS' | 'RED_FLAGS' | 'MYTHS' | 'FACT_CHECKS' | 'OTHER'
  color: string // hex without '#'
}

const COLLECTIONS: CollectionSeed[] = [
  {
    name: 'Call out Lies in a Fun Way',
    slug: 'call-out-lies',
    description: 'Fun and creative stickers to call out misinformation with humor',
    sortOrder: 1,
    category: 'LOVE_FACTS',
    color: 'D6534A',
  },
  {
    name: 'Kickstart Conversations',
    slug: 'kickstart-conversations',
    description: 'Start meaningful discussions about media literacy',
    sortOrder: 2,
    category: 'LOVE_FACTS',
    color: '4FC9A0',
  },
  {
    name: 'Respond to Misinformation',
    slug: 'respond-to-misinformation',
    description: 'Quick responses to counter false information',
    sortOrder: 3,
    category: 'FACT_CHECKS',
    color: '0A3D4C',
  },
  {
    name: 'Shift the Vibe',
    slug: 'shift-the-vibe',
    description: 'Lighten the mood while spreading truth',
    sortOrder: 4,
    category: 'LOVE_FACTS',
    color: '66A833',
  },
  {
    name: 'Make the Truth Go Viral',
    slug: 'make-truth-viral',
    description: 'Shareable stickers to amplify accurate information',
    sortOrder: 5,
    category: 'LOVE_FACTS',
    color: '3EB88D',
  },
  {
    name: 'Red Flags',
    slug: 'red-flags',
    description: 'Disinformation alert stickers — the classic tells of fake content',
    sortOrder: 6,
    category: 'RED_FLAGS',
    color: 'C44038',
  },
]

type StickerSeed = {
  title: string
  tags: string[]
  collection: number
  caption: string
}

const SAMPLE_STICKERS: StickerSeed[] = [
  // 0 — Call out Lies in a Fun Way
  { title: 'Fact Check First', tags: ['fact-check', 'verify', 'truth'], collection: 0, caption: 'Before you forward — verify.' },
  { title: 'Source Please', tags: ['source', 'citation', 'proof'], collection: 0, caption: "I'll wait — drop the source." },
  { title: 'Is This Real', tags: ['question', 'verify', 'doubt'], collection: 0, caption: 'Asking for a friend.' },
  { title: 'Pics Or It Didn\'t Happen', tags: ['evidence', 'photo', 'proof'], collection: 0, caption: 'No screenshot, no story.' },
  { title: 'Receipts?', tags: ['proof', 'receipts', 'truth'], collection: 0, caption: 'Show me the receipts.' },
  { title: 'My Source Is Vibes', tags: ['humor', 'satire', 'vibes'], collection: 0, caption: 'When the only source is "trust me bro".' },

  // 1 — Kickstart Conversations
  { title: 'Think Before You Share', tags: ['think', 'share', 'responsible'], collection: 1, caption: 'Pause before you press send.' },
  { title: "Let's Talk Facts", tags: ['conversation', 'facts', 'discuss'], collection: 1, caption: 'Real talk only.' },
  { title: 'Check Your Sources', tags: ['source', 'check', 'verify'], collection: 1, caption: 'Where did this even come from?' },
  { title: 'Sliding Into Truth', tags: ['truth', 'conversation', 'fun'], collection: 1, caption: 'Sliding into the chat with facts.' },
  { title: 'Curious Cat', tags: ['question', 'curious', 'doubt'], collection: 1, caption: 'Curiosity beats certainty.' },
  { title: 'Verified Vibes', tags: ['verify', 'vibes', 'truth'], collection: 1, caption: 'Verified energy only.' },

  // 2 — Respond to Misinformation
  { title: 'Fake News Alert', tags: ['fake', 'news', 'alert'], collection: 2, caption: 'Heads up — this one is fake.' },
  { title: 'Not Today Fake News', tags: ['fake', 'response', 'counter'], collection: 2, caption: 'Not today.' },
  { title: 'Citation Needed', tags: ['citation', 'proof', 'evidence'], collection: 2, caption: '[citation needed]' },
  { title: 'Fact Checked', tags: ['fact-check', 'verified'], collection: 2, caption: 'This has been fact-checked.' },
  { title: 'Misinformation Detected', tags: ['alert', 'misinformation'], collection: 2, caption: 'Misinformation detected.' },
  { title: 'Hold Up Lemme Check', tags: ['pause', 'verify', 'fun'], collection: 2, caption: 'Hold up — let me check that.' },

  // 3 — Shift the Vibe
  { title: 'Keep Calm and Verify', tags: ['calm', 'verify', 'peace'], collection: 3, caption: 'Keep calm and verify.' },
  { title: 'Truth Vibes Only', tags: ['truth', 'vibes', 'positive'], collection: 3, caption: 'Truth vibes only ✨' },
  { title: 'Good Info Energy', tags: ['energy', 'positive', 'info'], collection: 3, caption: 'Good-info energy only.' },
  { title: 'Stay Curious', tags: ['curious', 'open', 'wonder'], collection: 3, caption: 'Stay curious, not gullible.' },
  { title: 'Receipts Era', tags: ['proof', 'era', 'vibes'], collection: 3, caption: "We're in our receipts era." },
  { title: 'Logic Loading', tags: ['logic', 'wait', 'fun'], collection: 3, caption: 'Logic loading...' },

  // 4 — Make the Truth Go Viral
  { title: 'Love Facts', tags: ['love', 'facts', 'truth'], collection: 4, caption: 'I ❤️ facts.' },
  { title: 'Share the Truth', tags: ['share', 'truth', 'viral'], collection: 4, caption: 'Share the truth instead.' },
  { title: 'Truth Is Trending', tags: ['trending', 'truth', 'viral'], collection: 4, caption: 'Truth is trending.' },
  { title: 'Spread Truth', tags: ['spread', 'truth', 'movement'], collection: 4, caption: 'Spread truth, not rumours.' },
  { title: 'Media Literacy Wins', tags: ['literacy', 'wins', 'truth'], collection: 4, caption: 'Media literacy always wins.' },
  { title: 'Truth Drop', tags: ['truth', 'fact', 'drop'], collection: 4, caption: 'Truth drop incoming.' },

  // 5 — Red Flags
  { title: 'Red Flag: No Source', tags: ['red-flag', 'no-source'], collection: 5, caption: '🚩 No source given.' },
  { title: 'Red Flag: All Caps', tags: ['red-flag', 'allcaps', 'shouting'], collection: 5, caption: '🚩 SHOUTY ALL-CAPS HEADLINE.' },
  { title: 'Red Flag: Forward As Received', tags: ['red-flag', 'forward'], collection: 5, caption: '🚩 "Forward as received".' },
  { title: 'Red Flag: AI Generated', tags: ['red-flag', 'ai', 'generated'], collection: 5, caption: '🚩 Looks AI-generated.' },
  { title: 'Red Flag: Anonymous Doctor', tags: ['red-flag', 'fake-expert'], collection: 5, caption: '🚩 "A doctor friend said..."' },
  { title: 'Red Flag: Out Of Context', tags: ['red-flag', 'out-of-context'], collection: 5, caption: '🚩 Image is from a different event.' },
]

// Top 10 (by title) get curated hero rank 1..10
const HERO_TITLES_RANKED = [
  'Red Flag: No Source',
  'Fact Check First',
  'Think Before You Share',
  'Fake News Alert',
  'Love Facts',
  'Red Flag: Forward As Received',
  'Source Please',
  'Citation Needed',
  'Truth Is Trending',
  'Red Flag: AI Generated',
]

function placeholderUrl(title: string, color: string, size = 512): string {
  const text = encodeURIComponent(title).replace(/%20/g, '+')
  return `https://placehold.co/${size}x${size}/${color}/ffffff/png?text=${text}&font=poppins`
}

function thumbUrl(title: string, color: string): string {
  return placeholderUrl(title, color, 256)
}

// Stable deterministic-ish numbers so re-seeding doesn't reshuffle which
// sticker the spotlight surfaces as most-shared.
function fakeCounts(title: string, isHero: boolean) {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0
  const base = Math.abs(hash) % 100
  return {
    shareCount: isHero ? 80 + (base % 60) : base % 30,
    viewCount: isHero ? 500 + (base % 800) : 50 + (base % 200),
    usefulCount: isHero ? 12 + (base % 25) : base % 8,
  }
}

async function main() {
  console.log('🌱 Seeding Love Facts Stickers v2 demo data...\n')

  const createdCollections = []
  console.log('▸ Collections')
  for (const data of COLLECTIONS) {
    const collection = await prisma.collection.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        description: data.description,
        sortOrder: data.sortOrder,
        category: data.category,
      },
      create: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        sortOrder: data.sortOrder,
        category: data.category,
        featured: data.category === 'RED_FLAGS',
      },
    })
    createdCollections.push({ ...collection, _color: data.color })
    console.log(`  ✓ ${collection.name}  [${data.category}]`)
  }

  console.log('\n▸ Stickers')
  for (const s of SAMPLE_STICKERS) {
    const collection = createdCollections[s.collection]
    const slug = s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const id = `seed-${slug}`
    const heroRank = HERO_TITLES_RANKED.indexOf(s.title)
    const isHero = heroRank !== -1
    const counts = fakeCounts(s.title, isHero)

    await prisma.sticker.upsert({
      where: { id },
      update: {
        title: s.title,
        tags: s.tags,
        caption: s.caption,
        sourceUrl: placeholderUrl(s.title, collection._color),
        thumbnailUrl: thumbUrl(s.title, collection._color),
        isHero,
        heroRank: isHero ? heroRank + 1 : null,
        shareCount: counts.shareCount,
        viewCount: counts.viewCount,
        usefulCount: counts.usefulCount,
        mimeType: 'image/png',
        width: 512,
        height: 512,
      },
      create: {
        id,
        title: s.title,
        filename: `${slug}.png`,
        sourceUrl: placeholderUrl(s.title, collection._color),
        thumbnailUrl: thumbUrl(s.title, collection._color),
        tags: s.tags,
        caption: s.caption,
        collectionId: collection.id,
        isHero,
        heroRank: isHero ? heroRank + 1 : null,
        shareCount: counts.shareCount,
        viewCount: counts.viewCount,
        usefulCount: counts.usefulCount,
        mimeType: 'image/png',
        width: 512,
        height: 512,
      },
    })
    console.log(`  ✓ ${s.title}${isHero ? `  🔥 hero #${heroRank + 1}` : ''}`)
  }

  console.log('\n▸ Admin user')
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
  console.log(`  ✓ ${adminEmail}  (password: ${adminPassword})`)

  const totals = await Promise.all([
    prisma.collection.count(),
    prisma.sticker.count(),
    prisma.sticker.count({ where: { isHero: true } }),
  ])
  console.log(`\n✅ Done — ${totals[0]} collections, ${totals[1]} stickers (${totals[2]} heroes)`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
