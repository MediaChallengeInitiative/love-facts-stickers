'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 animate-pulse" />
    )
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
          'bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 hover:bg-lovefacts-turquoise/20 dark:hover:bg-lovefacts-turquoise/30',
          'border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30',
          'text-lovefacts-teal dark:text-lovefacts-turquoise'
        )}
        aria-label="Toggle theme"
      >
        <CurrentIcon size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute right-0 mt-2 w-40 z-50 rounded-xl overflow-hidden shadow-xl',
                'bg-white dark:bg-lovefacts-teal',
                'border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30'
              )}
            >
              {themes.map((t) => {
                const Icon = t.icon
                const isActive = theme === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => {
                      setTheme(t.value)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                      isActive
                        ? 'bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 text-lovefacts-coral dark:text-lovefacts-coral'
                        : 'text-lovefacts-teal dark:text-lovefacts-turquoise-light hover:bg-lovefacts-turquoise/5 dark:hover:bg-lovefacts-turquoise/10'
                    )}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{t.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTheme"
                        className="ml-auto w-2 h-2 rounded-full bg-lovefacts-coral"
                      />
                    )}
                  </button>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
