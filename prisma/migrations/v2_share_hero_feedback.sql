-- v2: Share engine, hero stickers, Red Flags category, optional feedback
-- Apply with: psql $DATABASE_URL -f prisma/migrations/v2_share_hero_feedback.sql
-- Idempotent — safe to re-run.

-- 1. Collection.category for Red Flags + other campaign categories.
ALTER TABLE "Collection" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'LOVE_FACTS';
CREATE INDEX IF NOT EXISTS "Collection_category_idx" ON "Collection"("category");

-- 2. Sticker: hero curation, engagement counters, mime/short-code/SEO.
ALTER TABLE "Sticker" ADD COLUMN IF NOT EXISTS "shortCode" TEXT;
ALTER TABLE "Sticker" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE "Sticker" ADD COLUMN IF NOT EXISTS "seoDescription" TEXT;
ALTER TABLE "Sticker" ADD COLUMN IF NOT EXISTS "isHero" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Sticker" ADD COLUMN IF NOT EXISTS "heroRank" INTEGER;
ALTER TABLE "Sticker" ADD COLUMN IF NOT EXISTS "heroCaption" TEXT;
ALTER TABLE "Sticker" ADD COLUMN IF NOT EXISTS "shareCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Sticker" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Sticker" ADD COLUMN IF NOT EXISTS "usefulCount" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS "Sticker_shortCode_key" ON "Sticker"("shortCode");
CREATE INDEX IF NOT EXISTS "Sticker_isHero_heroRank_idx" ON "Sticker"("isHero", "heroRank");
CREATE INDEX IF NOT EXISTS "Sticker_shareCount_idx" ON "Sticker"("shareCount");

-- 3. ShareEvent — per-share telemetry by channel.
CREATE TABLE IF NOT EXISTS "ShareEvent" (
  "id"        TEXT NOT NULL,
  "stickerId" TEXT NOT NULL,
  "channel"   TEXT NOT NULL,
  "ipHash"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShareEvent_pkey" PRIMARY KEY ("id")
);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ShareEvent_stickerId_fkey') THEN
    ALTER TABLE "ShareEvent"
      ADD CONSTRAINT "ShareEvent_stickerId_fkey"
      FOREIGN KEY ("stickerId") REFERENCES "Sticker"("id") ON DELETE CASCADE;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS "ShareEvent_stickerId_idx" ON "ShareEvent"("stickerId");
CREATE INDEX IF NOT EXISTS "ShareEvent_channel_idx" ON "ShareEvent"("channel");
CREATE INDEX IF NOT EXISTS "ShareEvent_createdAt_idx" ON "ShareEvent"("createdAt");

-- 4. Feedback — optional, post-action, anonymous.
CREATE TABLE IF NOT EXISTS "Feedback" (
  "id"        TEXT NOT NULL,
  "sentiment" TEXT,
  "missing"   TEXT,
  "channel"   TEXT,
  "stickerId" TEXT,
  "ipHash"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Feedback_sentiment_idx" ON "Feedback"("sentiment");
CREATE INDEX IF NOT EXISTS "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- 5. StickerSuggestion — empty-state user idea capture.
CREATE TABLE IF NOT EXISTS "StickerSuggestion" (
  "id"        TEXT NOT NULL,
  "idea"      TEXT NOT NULL,
  "ipHash"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StickerSuggestion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "StickerSuggestion_createdAt_idx" ON "StickerSuggestion"("createdAt");
