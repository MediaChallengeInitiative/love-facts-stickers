'use client'

import { LayoutGrid, Grid3x3, Square } from 'lucide-react'
import type { StickerCardDensity } from './StickerCard'
import { cn } from '@/lib/utils'

interface Props {
  value: StickerCardDensity
  onChange: (d: StickerCardDensity) => void
  className?: string
}

const OPTIONS: { value: StickerCardDensity; icon: React.ReactNode; label: string }[] = [
  { value: 'feature', icon: <Square size={14} />, label: 'Large cards' },
  { value: 'default', icon: <LayoutGrid size={14} />, label: 'Default grid' },
  { value: 'compact', icon: <Grid3x3 size={14} />, label: 'Compact grid' },
]

export function DensityToggle({ value, onChange, className }: Props) {
  return (
    <div
      role="group"
      aria-label="Sticker grid density"
      className={cn(
        'inline-flex items-center p-1 bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 rounded-xl',
        className
      )}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          aria-label={opt.label}
          title={opt.label}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-lg transition-all',
            value === opt.value
              ? 'bg-white dark:bg-lovefacts-teal text-lovefacts-coral shadow-sm'
              : 'text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60 hover:text-lovefacts-teal dark:hover:text-white'
          )}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  )
}
