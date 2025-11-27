'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Home, FolderOpen, Shield, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navLinks = [
  { href: '/', label: 'Gallery', icon: Home },
  { href: '/#collections', label: 'Collections', icon: FolderOpen },
  { href: '/privacy', label: 'Privacy', icon: Shield },
]

// Animation variants for the mobile menu
const menuVariants = {
  closed: {
    x: '100%',
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 40,
    },
  },
  open: {
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 40,
    },
  },
}

const backdropVariants = {
  closed: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
  open: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
}

const linkVariants = {
  closed: {
    x: 50,
    opacity: 0,
  },
  open: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: 0.1 + i * 0.1,
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  }),
}

const logoVariants = {
  closed: {
    scale: 0.8,
    opacity: 0,
  },
  open: {
    scale: 1,
    opacity: 1,
    transition: {
      delay: 0.05,
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const closeMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group z-50">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative h-10 w-24 xs:h-12 xs:w-28"
              >
                <Image
                  src="/images/love-facts-logo.png"
                  alt="Love Facts"
                  fill
                  className="object-contain dark:brightness-0 dark:invert"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-pink-400 transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <ThemeToggle />
            </nav>

            {/* Mobile Menu Button & Theme Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-50"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Full-screen Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Dark backdrop */}
            <motion.div
              variants={backdropVariants}
              initial="closed"
              animate="open"
              exit="closed"
              onClick={closeMenu}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />

            {/* Off-canvas Menu Panel */}
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl md:hidden flex flex-col"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                <motion.div
                  variants={logoVariants}
                  initial="closed"
                  animate="open"
                  className="flex items-center gap-3"
                >
                  <div className="relative h-14 w-32">
                    <Image
                      src="/images/love-facts-logo.png"
                      alt="Love Facts"
                      fill
                      className="object-contain dark:brightness-0 dark:invert"
                    />
                  </div>
                </motion.div>

                <motion.button
                  onClick={closeMenu}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </motion.button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-8 overflow-y-auto">
                <div className="space-y-2">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.href}
                      variants={linkVariants}
                      initial="closed"
                      animate="open"
                      custom={i}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-700 dark:text-slate-200 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-all duration-200 group"
                      >
                        <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-pink-100 dark:group-hover:bg-pink-500/20 transition-colors">
                          <link.icon size={22} className="text-slate-500 dark:text-slate-400 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors" />
                        </span>
                        <span className="text-lg font-medium">{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="my-8 h-px bg-slate-200 dark:bg-slate-800"
                />

                {/* External Link */}
                <motion.div
                  variants={linkVariants}
                  initial="closed"
                  animate="open"
                  custom={navLinks.length}
                >
                  <a
                    href="https://mciug.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-700 dark:text-slate-200 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-all duration-200 group"
                  >
                    <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-pink-100 dark:group-hover:bg-pink-500/20 transition-colors">
                      <ExternalLink size={22} className="text-slate-500 dark:text-slate-400 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors" />
                    </span>
                    <span className="text-lg font-medium">Visit MCI Website</span>
                  </a>
                </motion.div>
              </nav>

              {/* Menu Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 border-t border-slate-200 dark:border-slate-800"
              >
                <div className="text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Fighting misinformation with
                  </p>
                  <p className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                    Media Challenge Initiative
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
