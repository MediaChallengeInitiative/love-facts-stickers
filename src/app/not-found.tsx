import Link from 'next/link'
import { FileQuestion, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-lovefacts-turquoise-light dark:bg-lovefacts-teal-dark p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-lovefacts-turquoise/20 dark:bg-lovefacts-turquoise/10 rounded-full flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-lovefacts-teal dark:text-lovefacts-turquoise" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-lovefacts-teal dark:text-white mb-2">
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-lovefacts-teal dark:text-white mb-4">
          Page Not Found
        </h2>
        
        <p className="text-lovefacts-teal/70 dark:text-lovefacts-turquoise/70 mb-8">
          The sticker you&apos;re looking for might have been moved or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
          <Link href="/" className="flex-1">
            <Button variant="primary" size="lg" className="w-full">
              <Home className="mr-2" size={18} />
              Back to Home
            </Button>
          </Link>
          
          <Link href="/?search=true" className="flex-1">
            <Button variant="secondary" size="lg" className="w-full">
              <Search className="mr-2" size={18} />
              Search Stickers
            </Button>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-lovefacts-teal rounded-xl shadow-lg">
          <p className="text-sm text-lovefacts-teal/60 dark:text-lovefacts-turquoise/60">
            Looking for something specific? Try browsing our collections or use the search feature to find the perfect media literacy sticker.
          </p>
        </div>
      </div>
    </div>
  )
}