'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-lovefacts-teal dark:text-lovefacts-turquoise-light mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-lovefacts-turquoise/5 dark:bg-lovefacts-turquoise/10 border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 text-lovefacts-teal dark:text-white placeholder-lovefacts-teal/40 dark:placeholder-lovefacts-turquoise/40',
            'focus:outline-none focus:ring-2 focus:ring-lovefacts-turquoise focus:border-transparent',
            'transition-all duration-200',
            error && 'border-lovefacts-coral focus:ring-lovefacts-coral',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-lovefacts-coral" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-lovefacts-teal/50 dark:text-lovefacts-turquoise/50">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
