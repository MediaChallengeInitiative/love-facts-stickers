// WhatsApp sticker pack builder.
//
// Output conforms to WhatsApp's third-party sticker app spec:
//   - 3..30 stickers per pack
//   - Each sticker: 512x512 WebP, transparent background, < 100KB
//   - Tray icon: 96x96 PNG, < 50KB
//   - pack_info.json at archive root
//
// We stream the result as a .wastickers ZIP. On Android, the Add-to-WhatsApp
// intent picks up files with mimetype application/wastickers and routes them
// to WhatsApp's "Add sticker pack" handler.

import sharp from 'sharp'
import JSZip from 'jszip'

export interface StickerSource {
  id: string
  title: string
  sourceUrl: string
  emojis?: string[]
}

export interface BuildPackOptions {
  identifier: string
  name: string
  publisher: string
  trayIconUrl?: string
  publisherWebsite?: string
  licenseAgreementWebsite?: string
  privacyPolicyWebsite?: string
}

const MAX_STICKER_BYTES = 100 * 1024
const MAX_TRAY_BYTES = 50 * 1024

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`)
  const ab = await res.arrayBuffer()
  return Buffer.from(ab)
}

// Resize + re-encode at progressively lower quality until we fit under 100KB.
// WhatsApp rejects anything larger, so we MUST be under-budget.
async function encodeSticker(input: Buffer): Promise<Buffer> {
  // Step 1: normalize to 512x512 WebP on a transparent canvas.
  const base = sharp(input)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()

  for (const quality of [90, 80, 70, 60, 50, 40, 30]) {
    const buf = await base.clone().webp({ quality, effort: 6, alphaQuality: 80 }).toBuffer()
    if (buf.length <= MAX_STICKER_BYTES) return buf
  }
  // Last-ditch: lower lossless effort and crank quality down.
  return base.clone().webp({ quality: 20, effort: 6 }).toBuffer()
}

async function encodeTrayIcon(input: Buffer): Promise<Buffer> {
  const base = sharp(input).resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  for (const compressionLevel of [9, 8, 7, 6]) {
    const buf = await base.clone().png({ compressionLevel }).toBuffer()
    if (buf.length <= MAX_TRAY_BYTES) return buf
  }
  // Fall back to JPEG-like quality by going through WebP→PNG if needed.
  return base.clone().png({ compressionLevel: 9, quality: 80 }).toBuffer()
}

export async function buildStickerPack(
  stickers: StickerSource[],
  opts: BuildPackOptions
): Promise<{ buffer: Buffer; filename: string }> {
  if (stickers.length < 3) {
    throw new Error('WhatsApp requires at least 3 stickers per pack')
  }
  if (stickers.length > 30) {
    stickers = stickers.slice(0, 30)
  }

  const zip = new JSZip()
  const stickerEntries: { image_file: string; emojis: string[] }[] = []

  // Process stickers in parallel — sharp releases GIL, fetch is async.
  // A single bad source image must NOT fail the whole pack: encode failures
  // resolve to null and are dropped, so the user still gets a working pack.
  const processed = (
    await Promise.all(
      stickers.map(async (s) => {
        try {
          const input = await fetchBuffer(s.sourceUrl)
          const webp = await encodeSticker(input)
          return { sticker: s, webp }
        } catch (err) {
          console.warn(`[wastickers] skipping "${s.title}":`, err instanceof Error ? err.message : err)
          return null
        }
      })
    )
  ).filter((x): x is { sticker: StickerSource; webp: Buffer } => x !== null)

  if (processed.length < 3) {
    throw new Error(
      `Only ${processed.length} of ${stickers.length} sticker images could be loaded — need at least 3 for a WhatsApp pack`
    )
  }

  processed.forEach(({ sticker, webp }, index) => {
    const filename = `${String(index + 1).padStart(2, '0')}.webp`
    zip.file(filename, webp)
    stickerEntries.push({
      image_file: filename,
      emojis: (sticker.emojis && sticker.emojis.length > 0 ? sticker.emojis : ['💬']).slice(0, 3),
    })
  })

  // Tray icon: prefer caller-supplied, else reuse the first sticker that
  // successfully encoded.
  let trayBuf: Buffer
  try {
    const trayInput = opts.trayIconUrl
      ? await fetchBuffer(opts.trayIconUrl)
      : await fetchBuffer(processed[0].sticker.sourceUrl)
    trayBuf = await encodeTrayIcon(trayInput)
  } catch {
    // Last resort: derive the tray from the already-encoded first sticker.
    trayBuf = await encodeTrayIcon(processed[0].webp)
  }
  zip.file('tray.png', trayBuf)

  const packInfo = {
    identifier: opts.identifier,
    name: opts.name,
    publisher: opts.publisher,
    tray_image_file: 'tray.png',
    publisher_website: opts.publisherWebsite,
    license_agreement_website: opts.licenseAgreementWebsite,
    privacy_policy_website: opts.privacyPolicyWebsite,
    image_data_version: '1',
    avoid_cache: false,
    stickers: stickerEntries,
  }
  zip.file('pack_info.json', JSON.stringify(packInfo, null, 2))

  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })

  const safeName = opts.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'love-facts'
  return { buffer, filename: `${safeName}.wastickers` }
}
