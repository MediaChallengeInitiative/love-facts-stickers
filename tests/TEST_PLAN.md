# Love Facts Stickers - Comprehensive Test Plan

## 1. Sticker Share Links Testing

### Unit Tests

```typescript
// src/lib/urls.test.ts
import { getStickerShareUrl, getBaseUrl } from '@/lib/urls'

describe('URL Generation', () => {
  it('generates correct share URL', () => {
    const url = getStickerShareUrl('test-id')
    expect(url).toBe('https://lovefactsstickers.org/sticker/test-id')
  })

  it('uses environment variable for base URL', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://custom.domain.com'
    const url = getBaseUrl()
    expect(url).toBe('https://custom.domain.com')
  })
})
```

### Integration Tests

1. **Share Page Rendering**
   ```bash
   # Test valid sticker
   curl https://lovefactsstickers.org/sticker/{valid-id}
   # Should return 200 with proper HTML

   # Test invalid sticker
   curl https://lovefactsstickers.org/sticker/invalid-id
   # Should return 404
   ```

2. **Open Graph Tags**
   ```bash
   # Use Open Graph debugger
   https://developers.facebook.com/tools/debug/
   # Enter: https://lovefactsstickers.org/sticker/{id}
   # Verify image, title, description
   ```

3. **Social Media Sharing**
   - Click each share button
   - Verify pre-filled content
   - Check URL encoding
   - Test on mobile devices

### E2E Tests

```typescript
// e2e/share-sticker.spec.ts
import { test, expect } from '@playwright/test'

test('share sticker flow', async ({ page }) => {
  // Navigate to sticker page
  await page.goto('/sticker/test-id')
  
  // Check page elements
  await expect(page.locator('h1')).toContainText('Test Sticker')
  
  // Test share buttons
  const whatsappButton = page.locator('button:has-text("WhatsApp")')
  await whatsappButton.click()
  
  // Verify new window opened with correct URL
  const newPage = await context.waitForEvent('page')
  expect(newPage.url()).toContain('wa.me')
})
```

## 2. Google Drive Sync Testing

### Unit Tests

```typescript
// src/lib/google-drive-sync.test.ts
describe('DriveSyncEngine', () => {
  it('processes file additions', async () => {
    const engine = new DriveSyncEngine()
    const changes = [{
      fileId: 'test-id',
      file: { id: 'test-id', name: 'test.png', mimeType: 'image/png' }
    }]
    
    const result = await engine.processChanges(changes)
    expect(result.processed).toBe(1)
    expect(result.errors).toHaveLength(0)
  })

  it('handles file deletions', async () => {
    const engine = new DriveSyncEngine()
    const changes = [{
      fileId: 'test-id',
      removed: true
    }]
    
    const result = await engine.processChanges(changes)
    expect(result.processed).toBe(1)
  })
})
```

### Integration Tests

1. **Manual Sync Testing**
   ```bash
   # Test full sync
   npm run test:sync:full

   # Test incremental sync
   npm run test:sync:incremental
   ```

2. **Webhook Testing**
   ```bash
   # Send test webhook
   curl -X POST http://localhost:3000/api/webhooks/google-drive \
     -H "X-Goog-Channel-Id: test-channel" \
     -H "X-Goog-Resource-State: update" \
     -d '{}'
   ```

3. **Error Scenarios**
   - Invalid credentials
   - Rate limiting
   - Network failures
   - Corrupted data

### Performance Tests

```typescript
// performance/sync.test.ts
test('sync performance', async () => {
  const startTime = Date.now()
  
  // Process 1000 changes
  const changes = generateMockChanges(1000)
  await syncEngine.processChanges(changes)
  
  const duration = Date.now() - startTime
  expect(duration).toBeLessThan(30000) // 30 seconds
})
```

## 3. Edge Case Testing

### Sticker Sharing Edge Cases

1. **Special Characters in Names**
   - Emoji in sticker title
   - Unicode characters
   - HTML entities

2. **Network Conditions**
   - Slow 3G
   - Offline mode
   - Intermittent connection

3. **Browser Compatibility**
   - Chrome/Edge
   - Firefox
   - Safari
   - Mobile browsers

### Google Drive Sync Edge Cases

1. **File Operations**
   - Rename file multiple times quickly
   - Move file between folders rapidly
   - Delete and restore file
   - Upload duplicate names

2. **Folder Operations**
   - Rename collection folder
   - Delete folder with stickers
   - Create nested folders
   - Move folders

3. **Concurrent Operations**
   - Multiple sync requests
   - Webhook during manual sync
   - Database locks

## 4. Security Testing

### Authentication
```bash
# Test without credentials
curl -X POST /api/sync/drive-v2
# Should return 401

# Test with invalid token
curl -X POST /api/sync/drive-v2 \
  -H "Authorization: Bearer invalid"
# Should return 401
```

### Input Validation
- SQL injection attempts
- XSS in sticker names
- Path traversal in file IDs
- Large payload attacks

### Rate Limiting
```typescript
// Test rate limiting
for (let i = 0; i < 100; i++) {
  await fetch('/api/stickers')
}
// Should start returning 429 after threshold
```

## 5. Monitoring & Observability

### Metrics to Track
- Share link click-through rate
- Sync success/failure rate
- Average sync duration
- Error frequency by type

### Logging
```typescript
// Structured logging
logger.info('Sync completed', {
  syncId: syncLog.id,
  itemsSynced: 50,
  duration: 5000,
  errors: []
})
```

### Alerts
- Sync failures > 3 in a row
- Webhook endpoint down
- Database connection errors
- High error rate

## Test Automation Setup

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run E2E tests
        run: npm run test:e2e
```

### Local Testing Commands

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:sync:full": "ts-node scripts/test-full-sync.ts",
    "test:sync:incremental": "ts-node scripts/test-incremental-sync.ts"
  }
}
```

## Regression Testing Checklist

Before each release:

- [ ] All share links generate correctly
- [ ] Social media previews work
- [ ] QR codes scan properly
- [ ] Google Drive sync completes
- [ ] Webhooks receive notifications
- [ ] Error pages display correctly
- [ ] Performance metrics acceptable
- [ ] Security headers present
- [ ] No console errors
- [ ] Mobile experience smooth