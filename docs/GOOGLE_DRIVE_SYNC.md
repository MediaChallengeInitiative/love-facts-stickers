# Google Drive Automatic Sync Implementation

## Overview

The Google Drive sync system has been enhanced with:
- ✅ Google Drive Changes API for incremental updates
- ✅ Webhook support for real-time notifications
- ✅ OAuth 2.0 and Service Account authentication
- ✅ Automatic file/folder rename detection
- ✅ Batch processing with rate limiting
- ✅ Comprehensive error handling and retry logic

## Architecture

### Core Components

1. **DriveSyncEngine** (`src/lib/google-drive-sync.ts`)
   - Main sync orchestrator
   - Handles Changes API pagination
   - Processes file additions, updates, and deletions

2. **Authentication** (`src/lib/google-auth.ts`)
   - OAuth 2.0 client configuration
   - Service Account support
   - Token management

3. **Webhook Endpoint** (`src/app/api/webhooks/google-drive/route.ts`)
   - Receives push notifications from Google
   - Triggers incremental sync
   - Handles webhook verification

4. **Sync Utilities** (`src/lib/sync-utils.ts`)
   - State persistence
   - Retry logic with exponential backoff
   - Cleanup operations

## Setup Guide

### 1. Google Cloud Console Setup

1. Create a new project or select existing
2. Enable Google Drive API
3. Create credentials:
   - OAuth 2.0 Client ID (for user authentication)
   - Service Account (for server-side operations)
   - API Key (for public folder access)

### 2. Service Account Configuration

1. Create a service account:
   ```
   IAM & Admin → Service Accounts → Create Service Account
   ```

2. Grant permissions:
   - `Google Drive API - Drive Metadata Read`
   - `Google Drive API - Drive Read`

3. Create and download JSON key

4. Share your Drive folder with the service account email

### 3. Environment Variables

```env
# OAuth 2.0 (optional, for user-based auth)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Service Account (recommended for automatic sync)
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# API Key (for public folder access)
GOOGLE_API_KEY="your-api-key"

# Drive Configuration
GOOGLE_DRIVE_FOLDER_ID="1ejvH2Dgo41jYv7V247XLQSqbHkKFbNkq"

# App URL (required for webhooks)
NEXT_PUBLIC_APP_URL="https://stickers.lovefacts.africa"
```

### 4. Database Migration

Run the migration to add sync state tracking:

```bash
npx prisma migrate dev --name add_sync_state
```

## Usage

### Manual Sync

```bash
# Full sync
curl -X POST https://stickers.lovefacts.africa/api/sync/drive-v2 \
  -H "Content-Type: application/json" \
  -d '{"fullSync": true}'

# Incremental sync with webhook setup
curl -X POST https://stickers.lovefacts.africa/api/sync/drive-v2 \
  -H "Content-Type: application/json" \
  -d '{"setupWebhook": true}'
```

### Automatic Sync Flow

1. **Initial Setup**
   - Run full sync to populate database
   - Save page token for future incremental syncs

2. **Webhook Registration**
   - Google sends notifications to `/api/webhooks/google-drive`
   - Webhook triggers incremental sync

3. **Change Processing**
   - Fetch changes since last page token
   - Process in batches to avoid rate limits
   - Update database accordingly

## Implementation Details

### Change Detection

```typescript
// Watch for changes
const { changes, nextPageToken } = await syncEngine.watchChanges(pageToken)

// Process each change
for (const change of changes) {
  if (change.removed || change.file?.trashed) {
    // Handle deletion
  } else if (change.file) {
    // Handle addition/update
  }
}
```

### Rate Limiting Protection

- Batch processing (10 changes at a time)
- Delays between batches
- Exponential backoff on errors
- Request retry logic

### Error Handling

- Graceful degradation on API errors
- Detailed error logging
- Transaction rollback on failures
- Orphaned record cleanup

## Sync State Management

### Page Token Storage

```typescript
// Save page token for incremental sync
await setSyncState('drive_page_token', nextPageToken)

// Retrieve for next sync
const pageToken = await getSyncState('drive_page_token')
```

### Sync Logs

All sync operations are logged:
- Start time
- Items synced
- Errors encountered
- Completion status

## Testing

### Manual Testing

1. **Add File**: Upload image to Drive folder
2. **Rename File**: Change file name in Drive
3. **Move File**: Move between collections
4. **Delete File**: Remove or trash file
5. **Folder Operations**: Create, rename, delete folders

### Automated Testing

```typescript
// Test sync engine
const syncEngine = new DriveSyncEngine()
const changes = await syncEngine.watchChanges(pageToken)
const result = await syncEngine.processChanges(changes)
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify service account key is valid JSON
   - Check folder is shared with service account
   - Ensure API is enabled in Google Cloud

2. **Webhook Not Receiving Events**
   - Verify NEXT_PUBLIC_APP_URL is accessible
   - Check webhook endpoint returns 200 OK
   - Ensure HTTPS is configured

3. **Rate Limiting**
   - Implement exponential backoff
   - Reduce batch size
   - Add delays between requests

4. **Missing Changes**
   - Check page token is being saved
   - Verify incremental sync is working
   - Look for errors in sync logs

## Performance Optimization

1. **Caching**
   - Image proxy with 1-hour cache
   - In-memory result caching
   - Database query optimization

2. **Batch Operations**
   - Process changes in parallel
   - Bulk database updates
   - Efficient error handling

3. **Resource Management**
   - Connection pooling
   - Memory-efficient streaming
   - Automatic cleanup tasks

## Security Considerations

1. **Authentication**
   - Never expose service account keys
   - Use environment variables
   - Rotate credentials regularly

2. **Webhook Verification**
   - Validate Google headers
   - Implement request signing
   - Rate limit webhook endpoint

3. **Data Protection**
   - Validate all inputs
   - Sanitize file names
   - Prevent path traversal