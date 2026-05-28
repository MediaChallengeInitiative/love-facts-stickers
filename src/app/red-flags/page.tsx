import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react'
import prisma from '@/lib/db'
import { RedFlagsClient } from './RedFlagsClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://stickers.lovefacts.africa'

export const metadata: Metadata = {
  title: 'Red Flags — Spot disinformation before you share',
  description:
    'A campaign collection of Love Facts stickers calling out the red flags of disinformation: out-of-context images, fake screenshots, emotional manipulation, and the classics. Save them. Send them.',
  alternates: { canonical: '/red-flags' },
  openGraph: {
    title: 'Red Flags — Love Facts Stickers',
    description:
      'Spot disinformation before you share. Free sticker pack from the Media Challenge Initiative covering the most common red flags of misinformation in Uganda.',
    url: '/red-flags',
    type: 'article',
  },
}

async function getRedFlagStickers() {
  try {
    const stickers = await prisma.sticker.findMany({
      where: {
        collection: { category: 'RED_FLAGS' },
      },
      include: { collection: true },
      orderBy: [{ heroRank: 'asc' }, { createdAt: 'desc' }],
      take: 100,
    })
    return stickers
  } catch (err) {
    console.error('Red Flags fetch failed:', err)
    return []
  }
}

export default async function RedFlagsPage() {
  const stickers = await getRedFlagStickers()

  const collectionPageLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Red Flags — Love Facts Stickers',
    description:
      'A campaign collection of Love Facts stickers calling out the red flags of disinformation in Uganda.',
    url: `${SITE_URL}/red-flags`,
    isPartOf: { '@type': 'WebSite', name: 'Love Facts Stickers', url: SITE_URL },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: stickers.length,
      itemListElement: stickers.slice(0, 20).map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/sticker/${s.id}`,
        name: s.title,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-lovefacts-coral/5 via-white to-white dark:from-lovefacts-teal-dark dark:via-lovefacts-teal dark:to-lovefacts-teal-dark">
        <section className="relative overflow-hidden pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 bg-lovefacts-coral text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-lovefacts-coral/30">
              <AlertTriangle size={14} />
              Disinformation alert pack
            </div>

            <h1 className="text-4xl xs:text-5xl sm:text-6xl font-extrabold tracking-tight text-lovefacts-teal dark:text-white mb-4 leading-[1.05]">
              Red flags.
              <span className="block text-lovefacts-coral">Spot them before you share.</span>
            </h1>

            <p className="text-base sm:text-lg text-lovefacts-teal/80 dark:text-lovefacts-turquoise/80 max-w-2xl mx-auto leading-relaxed mb-6">
              Out-of-context images. Fake screenshots. Emotional manipulation. AI-generated &ldquo;facts.&rdquo; The same
              tricks turn up over and over in Ugandan group chats. Send these stickers when you see them.
            </p>

            <div className="flex flex-col xs:flex-row items-center justify-center gap-3">
              <Link
                href="#stickers"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-lovefacts-coral text-white font-semibold shadow-lg shadow-lovefacts-coral/30 hover:bg-lovefacts-coral-dark transition-colors"
              >
                <Sparkles size={18} />
                See the pack
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-1 px-6 py-3 rounded-2xl border-2 border-lovefacts-teal/20 text-lovefacts-teal dark:text-white dark:border-lovefacts-turquoise/40 hover:border-lovefacts-teal font-semibold transition-colors"
              >
                All Love Facts stickers
                <ArrowRight size={18} />
              </Link>
            </div>

            <p className="text-xs text-lovefacts-teal/50 dark:text-lovefacts-turquoise/50 mt-5">
              {stickers.length > 0
                ? `${stickers.length} red-flag stickers, free, no signup.`
                : 'Pack is being curated — check back soon.'}
            </p>
          </div>
        </section>

        <section id="stickers" className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-6xl mx-auto">
            {stickers.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-lovefacts-teal rounded-2xl border border-lovefacts-turquoise/20">
                <AlertTriangle className="w-12 h-12 mx-auto text-lovefacts-coral/60 mb-3" />
                <h2 className="text-lg font-bold text-lovefacts-teal dark:text-white mb-2">No red flag stickers yet</h2>
                <p className="text-sm text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60 max-w-md mx-auto">
                  Mark a collection&apos;s category as <code className="px-1.5 py-0.5 rounded bg-lovefacts-coral/10 text-lovefacts-coral">RED_FLAGS</code>{' '}
                  in the admin and its stickers will appear here automatically.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 mt-4 text-lovefacts-coral hover:text-lovefacts-coral-dark font-semibold text-sm"
                >
                  Browse all stickers <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <RedFlagsClient stickers={stickers} />
            )}
          </div>
        </section>
      </div>
    </>
  )
}
