import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Love Facts Stickers',
    short_name: 'Love Facts',
    description:
      'Free media literacy stickers from the Media Challenge Initiative. Save and send on WhatsApp, Telegram, Facebook, TikTok — clap back at lies in one tap.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#0A3D4C',
    categories: ['social', 'education', 'news'],
    lang: 'en-UG',
    icons: [
      {
        src: '/images/love-facts-logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/images/love-facts-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Red Flags',
        short_name: 'Red Flags',
        description: 'Stickers for spotting disinformation red flags',
        url: '/red-flags',
      },
      {
        name: 'Browse all stickers',
        short_name: 'Browse',
        description: 'See every Love Facts sticker',
        url: '/#gallery',
      },
    ],
  }
}
