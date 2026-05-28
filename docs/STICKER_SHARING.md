# Sticker Sharing (v2)

The share system is built around three guarantees:

1. **Zero gating.** No email, phone, or signup ever stands between a user and a sticker.
2. **Every Ugandan-popular channel is one tap away** — WhatsApp, WhatsApp Status, Telegram, TikTok, Facebook, Instagram, X, Snapchat, SMS, Email, Copy link, Copy image, Web Share API.
3. **WhatsApp gets first-class export** — packs build server-side, conform to WhatsApp's third-party sticker spec, and arrive as `.wastickers` ZIP files.

## URL structure

```
https://stickers.lovefacts.africa/sticker/{sticker-id}
https://stickers.lovefacts.africa/s/{shortCode}              # planned, see roadmap
https://stickers.lovefacts.africa/red-flags                  # campaign landing
```

Sticker pages are server-rendered with full Open Graph + ImageObject JSON-LD so previews unfurl correctly on every chat app.

## Share engine

`src/lib/share-engine.ts` exposes the `useShareEngine(subject)` hook. The UI calls it once and gets:

- `channels` — every available channel for the current device (feature-detected)
- `primary` — the most-relevant channel, promoted from `localStorage` if the user has shared before, else WhatsApp
- `share(channelId)` — runs that channel's deeplink, share intent, or clipboard handoff

Channels are added by appending one entry to the array. Each entry declares its `available` predicate so things like Web Share files only appear when `navigator.canShare({ files })` returns true.

### Per-channel behavior

| Channel | Mechanism |
|---|---|
| WhatsApp | `https://wa.me/?text=…` |
| WhatsApp Status | `navigator.share({ files: [...] })` when supported, falls back to "save then post" hint |
| Telegram | `https://t.me/share/url?…` |
| TikTok | Copies caption to clipboard + opens `https://www.tiktok.com/upload` |
| Facebook | `https://www.facebook.com/sharer/sharer.php?…` |
| Instagram | Copies caption + link to clipboard, prompts user to paste |
| X | `https://twitter.com/intent/tweet?…` |
| Snapchat | `https://www.snapchat.com/scan?attachmentUrl=…` (Creative Kit) |
| SMS | `sms:?&body=…` (works on every feature phone with a browser) |
| Email | `mailto:?subject=…&body=…` |
| Copy link | `navigator.clipboard.writeText(...)` |
| Copy image | `navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])` |
| Native | `navigator.share(...)` |

Every share fires `POST /api/sticker/{id}/share-track`, which writes a `ShareEvent` row and increments `Sticker.shareCount` in a transaction. Telemetry never blocks the share.

## WhatsApp `.wastickers` pack export

### Endpoint

```
POST /api/sticker-pack/build
```

Request body (one of):

```jsonc
{ "heroOnly": true,                          "packName": "Love Facts — Top picks" }
{ "collectionId": "cl…",                     "packName": "Love Facts — Red Flags" }
{ "stickerIds": ["cl…", "cl…", "cl…"],       "packName": "Custom pack" }
```

Response: `application/wastickers` ZIP attachment containing:

- `01.webp` … `NN.webp` — each sticker resized to **512×512 WebP** on a transparent canvas, compressed under **100KB** by progressive quality reduction
- `tray.png` — **96×96 PNG** tray icon, under **50KB**, derived from the caller's `trayIconUrl` or the first sticker
- `pack_info.json` — identifier, name, publisher (`Media Challenge Initiative`), publisher/license/privacy URLs, image_data_version, sticker emojis

The endpoint runs on the **Node.js runtime** (sharp + JSZip are native) with `maxDuration = 60`. Sharp processes stickers in parallel.

### Client trigger

```tsx
import { AddToWhatsAppButton } from '@/components/share/AddToWhatsAppButton'

<AddToWhatsAppButton
  target={{ kind: 'heroes', packName: 'Love Facts — Top picks' }}
  label="Get the WhatsApp Pack →"
/>
```

On **Android**, the downloaded file's mimetype triggers WhatsApp's "Add sticker pack" intent. On **iOS**, the same flow does not work — WhatsApp iOS only accepts packs imported by companion apps. The button detects iOS and shows an instruction sheet pointing users at individual sticker saves. A native iOS companion (Snap-Kit-style) is in the roadmap.

### Pack identifier strategy

`identifier` is derived from inputs (`heroes`, the collection ID, or a sorted hash of sticker IDs) so re-installing the same pack updates rather than duplicating in the WhatsApp UI.

## Telegram pack (planned)

A `t.me/addstickers/LoveFactsUG_<slug>` flow is scaffolded but requires an MCI-owned Telegram bot token. See `scripts/publish-telegram-pack.ts` (TODO) and set `TELEGRAM_BOT_TOKEN` when ready.

## Hero spotlight + curation

`Sticker.isHero` + `Sticker.heroRank` flag the 10 stickers Silas wants to push. `GET /api/stickers/hero` returns them; the `HeroSpotlight` component renders them as a snap-scroll carousel between the hero and collections. With zero heroes configured, the endpoint falls back to top 10 by `shareCount` so the section is never empty.

Set heroes from the admin (UI in roadmap) or directly:

```sql
UPDATE "Sticker"
SET "isHero" = true, "heroRank" = 1
WHERE id = 'cl…';
```

## Red Flags as a category

Set `Collection.category = 'RED_FLAGS'`. The `/red-flags` SSR page surfaces every sticker in any collection with that category, and the "Add Red Flags pack to WhatsApp" button appears once you have ≥3 stickers in the category.

```sql
UPDATE "Collection" SET "category" = 'RED_FLAGS' WHERE slug = 'red-flags';
```

## Configuration

```env
NEXT_PUBLIC_APP_URL="https://stickers.lovefacts.africa"
IP_HASH_SALT="<long random string — anonymises analytics>"
# TELEGRAM_BOT_TOKEN=...  # planned
```

## Testing checklist

- [ ] Tap any sticker's **Save** button → file downloads, toast shows WhatsApp Send shortcut
- [ ] Open ShareSheet → every available channel works (deeplinks open the right app or copy the right text)
- [ ] `POST /api/sticker-pack/build {"heroOnly":true}` returns a valid `.wastickers` ZIP (~100-500KB)
- [ ] On Android Chrome, downloading the pack triggers WhatsApp's "Add sticker pack" handler
- [ ] On iOS, the iOS notice sheet appears explaining the limitation
- [ ] `/red-flags` renders SSR with structured data
- [ ] Sticker URL pasted into WhatsApp unfurls with the right image + caption
- [ ] Feedback pill only appears after one download/share, dismissible for 7 days
- [ ] `sitemap.xml`, `robots.txt`, `manifest.webmanifest` all serve correctly
