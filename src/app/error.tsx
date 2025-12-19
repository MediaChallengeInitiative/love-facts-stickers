'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-lovefacts-turquoise-light dark:bg-lovefacts-teal-dark p-4">
      <div className="max-w-md w-full bg-white dark:bg-lovefacts-teal rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-lovefacts-coral/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-lovefacts-coral" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-lovefacts-teal dark:text-white mb-2">
          Oops! Something went wrong
        </h1>
        
        <p className="text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 mb-6">
          We encountered an unexpected error. Don&apos;t worry, our team has been notified.
        </p>

        {error.message && (
          <div className="mb-6 p-3 bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/20 rounded-lg">
            <p className="text-sm text-lovefacts-teal dark:text-lovefacts-turquoise font-mono">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={reset}
            variant="primary"
            className="flex-1"
          >
            <RefreshCw className="mr-2" size={16} />
            Try Again
          </Button>
          
          <Link href="/" className="flex-1">
            <Button variant="secondary" className="w-full">
              <Home className="mr-2" size={16} />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}