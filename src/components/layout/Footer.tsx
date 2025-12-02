'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Mail, ExternalLink } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-lovefacts-turquoise/5 dark:bg-lovefacts-teal-dark border-t border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 xs:py-10 sm:py-12">
        <div className="grid grid-cols-2 xs:grid-cols-2 md:grid-cols-3 gap-6 xs:gap-8">
          {/* Brand */}
          <div className="col-span-2 xs:col-span-2 md:col-span-1">
            <div className="mb-3 xs:mb-4">
              <div className="relative h-12 w-28 xs:h-14 xs:w-32 mb-2">
                <Image
                  src="/images/love-facts-logo.png"
                  alt="Love Facts"
                  fill
                  className="object-contain dark:brightness-0 dark:invert"
                />
              </div>
              <p className="text-[10px] xs:text-xs text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70">Media Literacy Stickers</p>
            </div>
            <p className="text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 leading-relaxed">
              Free stickers to fight misinformation and spread media literacy.
              Download, share, and make the truth go viral!
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs xs:text-sm font-semibold text-lovefacts-teal dark:text-white mb-3 xs:mb-4">Quick Links</h4>
            <ul className="space-y-1.5 xs:space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 hover:text-lovefacts-coral dark:hover:text-lovefacts-coral transition-colors"
                >
                  Browse Stickers
                </Link>
              </li>
              <li>
                <Link
                  href="/#collections"
                  className="text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 hover:text-lovefacts-coral dark:hover:text-lovefacts-coral transition-colors"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 hover:text-lovefacts-coral dark:hover:text-lovefacts-coral transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/unsubscribe"
                  className="text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 hover:text-lovefacts-coral dark:hover:text-lovefacts-coral transition-colors"
                >
                  Unsubscribe
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs xs:text-sm font-semibold text-lovefacts-teal dark:text-white mb-3 xs:mb-4">Get in Touch</h4>
            <ul className="space-y-2 xs:space-y-3">
              <li>
                <a
                  href="mailto:info@mciug.org"
                  className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 hover:text-lovefacts-coral dark:hover:text-lovefacts-coral transition-colors"
                >
                  <Mail size={14} className="xs:w-4 xs:h-4" />
                  info@mciug.org
                </a>
              </li>
              <li>
                <a
                  href="https://mciug.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 hover:text-lovefacts-coral dark:hover:text-lovefacts-coral transition-colors"
                >
                  <ExternalLink size={14} className="xs:w-4 xs:h-4" />
                  <span className="hidden xs:inline">Media Challenge Initiative</span>
                  <span className="xs:hidden">MCI Website</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 xs:mt-10 sm:mt-12 pt-6 xs:pt-8 border-t border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 flex flex-col sm:flex-row items-center justify-between gap-3 xs:gap-4">
          <p className="text-[10px] xs:text-xs sm:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 text-center sm:text-left">
            &copy; {currentYear} Media Challenge Initiative. All rights reserved.
          </p>
          <p className="text-[10px] xs:text-xs sm:text-sm text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70">
            Made with <Heart className="inline w-3 h-3 xs:w-4 xs:h-4 text-lovefacts-coral" fill="currentColor" /> for media literacy
          </p>
        </div>
      </div>
    </footer>
  )
}
