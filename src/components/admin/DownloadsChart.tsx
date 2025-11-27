'use client'

import { useMemo } from 'react'

interface DataPoint {
  date: string
  count: number
}

interface DownloadsChartProps {
  data: DataPoint[]
  className?: string
}

export function DownloadsChart({ data, className }: DownloadsChartProps) {
  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data])

  return (
    <div className={className}>
      <div className="h-64 flex items-end gap-1">
        {data.map((point, index) => {
          const height = (point.count / maxCount) * 100

          return (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center justify-end group"
            >
              {/* Bar */}
              <div
                className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-300 hover:from-purple-500 hover:to-purple-300 relative"
                style={{ height: `${Math.max(height, 2)}%` }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-700 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    <p className="font-medium">{point.count} downloads</p>
                    <p className="text-slate-400">
                      {new Date(point.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date label (show every 7th) */}
              {index % 7 === 0 && (
                <span className="text-[10px] text-slate-500 mt-2 -rotate-45 origin-top-left">
                  {new Date(point.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Y-axis labels */}
      <div className="flex justify-between text-xs text-slate-500 mt-4">
        <span>0</span>
        <span>{Math.round(maxCount / 2)}</span>
        <span>{maxCount}</span>
      </div>
    </div>
  )
}
