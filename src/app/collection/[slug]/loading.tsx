/**
 * Route-level loading UI for /collection/[slug]. Shown while the Server
 * Component resolves (e.g. on-demand render of a not-yet-cached category).
 * Mirrors the page's header + grid shape so the layout doesn't jump.
 */
export default function CollectionLoading() {
  return (
    <div className="min-h-[100svh]">
      <section className="bg-gradient-to-br from-white via-lovefacts-turquoise/5 to-lovefacts-coral/5 dark:from-lovefacts-teal-dark dark:via-lovefacts-teal dark:to-lovefacts-teal-dark border-b border-lovefacts-turquoise/15 dark:border-lovefacts-turquoise/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <div className="h-4 w-40 bg-lovefacts-turquoise/15 dark:bg-lovefacts-turquoise/20 rounded mb-4 animate-pulse" />
          <div className="h-4 w-28 bg-lovefacts-coral/20 rounded mb-5 animate-pulse" />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-lovefacts-coral/15 animate-pulse" />
            <div className="flex-1">
              <div className="h-8 w-2/3 max-w-sm bg-lovefacts-turquoise/15 dark:bg-lovefacts-turquoise/20 rounded mb-3 animate-pulse" />
              <div className="h-4 w-1/2 max-w-md bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/15 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-11 w-full bg-white dark:bg-lovefacts-teal border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30 rounded-xl mb-8 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 xs:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-lovefacts-teal rounded-2xl overflow-hidden border border-lovefacts-turquoise/20 dark:border-lovefacts-turquoise/30"
            >
              <div className="aspect-square bg-lovefacts-turquoise/5 dark:bg-lovefacts-teal-dark animate-pulse" />
              <div className="p-3">
                <div className="h-3.5 w-3/4 bg-lovefacts-turquoise/15 dark:bg-lovefacts-turquoise/20 rounded mb-2.5 animate-pulse" />
                <div className="flex gap-1.5">
                  <div className="flex-1 h-9 bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/15 rounded-lg animate-pulse" />
                  <div className="flex-1 h-9 bg-lovefacts-turquoise/10 dark:bg-lovefacts-turquoise/15 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
