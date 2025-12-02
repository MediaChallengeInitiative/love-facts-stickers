import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Mail, Trash2, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | Love Facts Stickers',
  description: 'Learn how we collect, use, and protect your data when you download our media literacy stickers.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-lovefacts-teal-dark pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-lovefacts-turquoise/20 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-lovefacts-turquoise dark:text-lovefacts-turquoise-light" />
          </div>
          <h1 className="text-4xl font-bold text-lovefacts-teal dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70">Last updated: November 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="bg-lovefacts-turquoise/5 dark:bg-lovefacts-teal rounded-2xl p-8 border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-lovefacts-teal dark:text-white mb-4">Introduction</h2>
              <p className="text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light leading-relaxed">
                Media Challenge Initiative (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the Love Facts
                Sticker Portal. This Privacy Policy explains how we collect, use, and protect your
                personal information when you use our service.
              </p>
              <p className="text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light leading-relaxed mt-4">
                We are committed to protecting your privacy and only collect data necessary to measure
                the impact of our media literacy initiatives and improve our services.
              </p>
            </section>

            {/* What We Collect */}
            <section>
              <h2 className="text-xl font-semibold text-lovefacts-teal dark:text-white mb-4">What We Collect</h2>
              <p className="text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light mb-4">When you download stickers, we may collect:</p>
              <ul className="space-y-2 text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light">
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-lovefacts-turquoise dark:text-lovefacts-turquoise mt-0.5 flex-shrink-0" />
                  <span><strong>Email address</strong> — To measure unique downloads and optionally notify you of new sticker packs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 text-lovefacts-turquoise dark:text-lovefacts-turquoise mt-0.5 flex-shrink-0 flex items-center justify-center">📱</span>
                  <span><strong>Phone number</strong> — Alternative contact method for the same purposes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 text-lovefacts-turquoise dark:text-lovefacts-turquoise mt-0.5 flex-shrink-0 flex items-center justify-center">👤</span>
                  <span><strong>Name (optional)</strong> — To personalize communications if you opt in</span>
                </li>
              </ul>
              <p className="text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light mt-4">
                We also automatically collect anonymous usage data including download counts, page views,
                and general geographic regions (not precise locations) to understand how our stickers are
                being used and shared.
              </p>
            </section>

            {/* How We Use Data */}
            <section>
              <h2 className="text-xl font-semibold text-lovefacts-teal dark:text-white mb-4">How We Use Your Data</h2>
              <ul className="space-y-3 text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-lovefacts-green/20 text-lovefacts-green dark:text-lovefacts-green-light text-xs flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span><strong>Impact Measurement:</strong> To count unique downloads and measure the reach of our media literacy campaign</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-lovefacts-green/20 text-lovefacts-green dark:text-lovefacts-green-light text-xs flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span><strong>New Sticker Notifications:</strong> To inform you when new sticker packs are available (if you opt in)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-lovefacts-green/20 text-lovefacts-green dark:text-lovefacts-green-light text-xs flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                  <span><strong>Service Improvement:</strong> To understand which stickers are popular and improve future designs</span>
                </li>
              </ul>

              <div className="mt-6 p-4 bg-lovefacts-coral/10 border border-lovefacts-coral/20 rounded-xl">
                <p className="text-lovefacts-coral dark:text-lovefacts-coral-light font-medium">We will NEVER:</p>
                <ul className="mt-2 space-y-1 text-lovefacts-coral/80 dark:text-lovefacts-coral-light/80 text-sm">
                  <li>• Sell or share your personal information with third parties</li>
                  <li>• Send spam or unsolicited marketing messages</li>
                  <li>• Use your data for purposes other than those listed above</li>
                </ul>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-semibold text-lovefacts-teal dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-lovefacts-turquoise dark:text-lovefacts-turquoise" />
                Data Retention
              </h2>
              <p className="text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light">
                We retain your personal information for a maximum of <strong>12 months</strong> from the
                date of collection. After this period, your contact information will be automatically
                deleted, though we may retain anonymized aggregate statistics for reporting purposes.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold text-lovefacts-teal dark:text-white mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-lovefacts-turquoise dark:text-lovefacts-turquoise" />
                Your Rights
              </h2>
              <p className="text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light mb-4">You have the right to:</p>
              <ul className="space-y-2 text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light">
                <li>• <strong>Access</strong> your personal data we have stored</li>
                <li>• <strong>Correct</strong> any inaccurate information</li>
                <li>• <strong>Delete</strong> your personal data from our systems</li>
                <li>• <strong>Unsubscribe</strong> from any communications</li>
                <li>• <strong>Object</strong> to how we use your data</li>
              </ul>
              <p className="text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light mt-4">
                To exercise any of these rights, please use our{' '}
                <Link href="/unsubscribe" className="text-lovefacts-coral dark:text-lovefacts-coral hover:underline">
                  data deletion request form
                </Link>{' '}
                or contact us at{' '}
                <a href="mailto:info@mciug.org" className="text-lovefacts-coral dark:text-lovefacts-coral hover:underline">
                  info@mciug.org
                </a>.
              </p>
            </section>

            {/* Anonymous Downloads */}
            <section>
              <h2 className="text-xl font-semibold text-lovefacts-teal dark:text-white mb-4">Anonymous Downloads</h2>
              <p className="text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light">
                You can always choose to download stickers as a guest without providing any personal
                information. We will still count the download for our metrics, but we won&apos;t be able
                to contact you about new sticker packs.
              </p>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-xl font-semibold text-lovefacts-teal dark:text-white mb-4">Security</h2>
              <p className="text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light">
                We implement appropriate technical and organizational measures to protect your personal
                data against unauthorized access, alteration, disclosure, or destruction. This includes
                encryption of data in transit and at rest, regular security assessments, and access
                controls for our staff.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-lovefacts-teal dark:text-white mb-4">Contact Us</h2>
              <p className="text-lovefacts-teal/80 dark:text-lovefacts-turquoise-light">
                If you have any questions about this Privacy Policy or how we handle your data, please
                contact us:
              </p>
              <div className="mt-4 p-4 bg-white dark:bg-lovefacts-teal-light/30 rounded-xl border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30">
                <p className="text-lovefacts-teal dark:text-white font-medium">Media Challenge Initiative</p>
                <p className="text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 mt-1">
                  Email:{' '}
                  <a href="mailto:info@mciug.org" className="text-lovefacts-coral dark:text-lovefacts-coral hover:underline">
                    info@mciug.org
                  </a>
                </p>
                <p className="text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70">
                  Website:{' '}
                  <a href="https://mciug.org" target="_blank" rel="noopener noreferrer" className="text-lovefacts-coral dark:text-lovefacts-coral hover:underline">
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
