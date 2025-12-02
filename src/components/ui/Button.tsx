'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-gradient-to-r from-lovefacts-coral to-lovefacts-coral-dark text-white hover:from-lovefacts-coral-dark hover:to-lovefacts-coral focus:ring-lovefacts-coral shadow-lg hover:shadow-xl shadow-lovefacts-coral/25',
      secondary: 'bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 text-lovefacts-teal dark:text-white hover:bg-lovefacts-turquoise/20 dark:hover:bg-lovefacts-turquoise/30 focus:ring-lovefacts-turquoise',
      outline: 'border-2 border-lovefacts-turquoise text-lovefacts-teal dark:text-lovefacts-turquoise hover:bg-lovefacts-turquoise hover:text-white focus:ring-lovefacts-turquoise',
      ghost: 'text-lovefacts-teal dark:text-lovefacts-turquoise-light hover:text-lovefacts-teal-dark dark:hover:text-white hover:bg-lovefacts-turquoise/10 dark:hover:bg-lovefacts-turquoise/20 focus:ring-lovefacts-turquoise',
      danger: 'bg-lovefacts-coral text-white hover:bg-lovefacts-coral-dark focus:ring-lovefacts-coral',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-8 py-3.5 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
