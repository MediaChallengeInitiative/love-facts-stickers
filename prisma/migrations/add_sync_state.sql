-- Add sync state tracking
CREATE TABLE IF NOT EXISTS "SyncState" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "SyncState_pkey" PRIMARY KEY ("id")
);

-- Create unique index on key
CREATE UNIQUE INDEX "SyncState_key_key" ON "SyncState"("key");

-- Add webhook tracking to SyncLog
ALTER TABLE "SyncLog" ADD COLUMN IF NOT EXISTS "webhookId" TEXT;
ALTER TABLE "SyncLog" ADD COLUMN IF NOT EXISTS "pageToken" TEXT;