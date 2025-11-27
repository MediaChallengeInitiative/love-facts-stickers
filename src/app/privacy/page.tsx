import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Mail, Trash2, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Love Facts Stickers',
  description: 'Learn how we collect, use, and protect your data when you download our media literacy stickers.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500/20 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-pink-500 dark:text-pink-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400">Last updated: November 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Introduction</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Media Challenge Initiative (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the Love Facts
                Sticker Portal. This Privacy Policy explains how we collect, use, and protect your
                personal information when you use our service.
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
                We are committed to protecting your privacy and only collect data necessary to measure
                the impact of our media literacy initiatives and improve our services.
              </p>
            </section>

            {/* What We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">What We Collect</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">When you download stickers, we may collect:</p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-pink-500 dark:text-pink-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Email address</strong> — To measure unique downloads and optionally notify you of new sticker packs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 text-pink-500 dark:text-pink-400 mt-0.5 flex-shrink-0 flex items-center justify-center">📱</span>
                  <span><strong>Phone number</strong> — Alternative contact method for the same purposes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 text-pink-500 dark:text-pink-400 mt-0.5 flex-shrink-0 flex items-center justify-center">👤</span>
                  <span><strong>Name (optional)</strong> — To personalize communications if you opt in</span>
                </li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                We also automatically collect anonymous usage data including download counts, page views,
                and general geographic regions (not precise locations) to understand how our stickers are
                being used and shared.
              </p>
            </section>

            {/* How We Use Data */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">How We Use Your Data</h2>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 dark:text-green-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span><strong>Impact Measurement:</strong> To count unique downloads and measure the reach of our media literacy campaign</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 dark:text-green-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span><strong>New Sticker Notifications:</strong> To inform you when new sticker packs are available (if you opt in)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 dark:text-green-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span><strong>Service Improvement:</strong> To understand which stickers are popular and improve future designs</span>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-600 dark:text-red-300 font-medium">We will NEVER:</p>
                <ul className="mt-2 space-y-1 text-red-500/80 dark:text-red-200/80 text-sm">
                  <li>• Sell or share your personal information with third parties</li>
                  <li>• Send spam or unsolicited marketing messages</li>
                  <li>• Use your data for purposes other than those listed above</li>
                </ul>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                Data Retention
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                We retain your personal information for a maximum of <strong>12 months</strong> from the
                date of collection. After this period, your contact information will be automatically
                deleted, though we may retain anonymized aggregate statistics for reporting purposes.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                Your Rights
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-4">You have the right to:</p>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li>• <strong>Access</strong> your personal data we have stored</li>
                <li>• <strong>Correct</strong> any inaccurate information</li>
                <li>• <strong>Delete</strong> your personal data from our systems</li>
                <li>• <strong>Unsubscribe</strong> from any communications</li>
                <li>• <strong>Object</strong> to how we use your data</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-300 mt-4">
                To exercise any of these rights, please use our{' '}
                <Link href="/unsubscribe" className="text-pink-500 dark:text-pink-400 hover:underline">
                  data deletion request form
                </Link>{' '}
                or contact us at{' '}
                <a href="mailto:info@mciug.org" className="text-pink-500 dark:text-pink-400 hover:underline">
                  info@mciug.org
                </a>.
              </p>
            </section>

            {/* Anonymous Downloads */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Anonymous Downloads</h2>
              <p className="text-slate-600 dark:text-slate-300">
                You can always choose to download stickers as a guest without providing any personal
                information. We will still count the download for our metrics, but we won&apos;t be able
                to contact you about new sticker packs.
              </p>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Security</h2>
              <p className="text-slate-600 dark:text-slate-300">
                We implement appropriate technical and organizational measures to protect your personal
                data against unauthorized access, alteration, disclosure, or destruction. This includes
                encryption of data in transit and at rest, regular security assessments, and access
                controls for our staff.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Contact Us</h2>
              <p className="text-slate-600 dark:text-slate-300">
                If you have any questions about this Privacy Policy or how we handle your data, please
                contact us:
              </p>
              <div className="mt-4 p-4 bg-white dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-transparent">
                <p className="text-slate-900 dark:text-white font-medium">Media Challenge Initiative</p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Email:{' '}
                  <a href="mailto:info@mciug.org" className="text-pink-500 dark:text-pink-400 hover:underline">
                    info@mciug.org
                  </a>
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Website:{' '}
                  <a href="https://mciug.org" target="_blank" rel="noopener noreferrer" className="text-pink-500 dark:text-pink-400 hover:underline">
                    mciug.org
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
