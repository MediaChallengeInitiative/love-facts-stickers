'use client'

// On mobile (< md) we render each download as a stacked card; the table
// layout only kicks in on desktop where the columns actually have room.

import { formatDateTime } from '@/lib/utils'
import { ChevronLeft, ChevronRight, User, Mail, Phone, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Download {
  id: string
  userEmail: string | null
  userPhone: string | null
  userName: string | null
  isAnonymous: boolean
  downloadType: string
  createdAt: string
  sticker: {
    id: string
    title: string
    collection: {
      name: string
    }
  }
}

interface DownloadsTableProps {
  downloads: Download[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  isLoading?: boolean
}

function UserCell({ d }: { d: Download }) {
  if (d.isAnonymous) {
    return (
      <span className="inline-flex items-center gap-1.5 text-slate-400 text-sm">
        <User size={14} />
        Anonymous
      </span>
    )
  }
  return (
    <div className="space-y-0.5 min-w-0">
      {d.userName && <p className="text-white text-sm truncate">{d.userName}</p>}
      {d.userEmail && (
        <span className="flex items-center gap-1 text-xs text-slate-400 truncate">
          <Mail size={12} className="shrink-0" />
          <span className="truncate">{d.userEmail}</span>
        </span>
      )}
      {d.userPhone && (
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Phone size={12} className="shrink-0" />
          {d.userPhone}
        </span>
      )}
    </div>
  )
}

export function DownloadsTable({ downloads, pagination, onPageChange, isLoading }: DownloadsTableProps) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Mobile card list */}
      <div className="md:hidden divide-y divide-slate-700">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="p-4 space-y-2">
              <div className="h-4 bg-slate-700 rounded animate-pulse w-2/3" />
              <div className="h-3 bg-slate-700/60 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-slate-700/60 rounded animate-pulse w-1/3" />
            </div>
          ))
        ) : downloads.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No downloads found</div>
        ) : (
          downloads.map((d) => (
            <article key={d.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <ImageIcon size={14} className="text-purple-400 shrink-0" aria-hidden="true" />
                  <span className="text-white text-sm font-medium truncate">{d.sticker.title}</span>
                </div>
                <Badge variant={d.downloadType === 'single' ? 'info' : 'success'} size="sm">
                  {d.downloadType}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 truncate">From: {d.sticker.collection.name}</p>
              <UserCell d={d} />
              <p className="text-[11px] text-slate-500">{formatDateTime(d.createdAt)}</p>
            </article>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-700/50 text-left">
              <th className="px-4 py-3 text-sm font-medium text-slate-300">User</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-300">Sticker</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-300">Collection</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-300">Type</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-300">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-slate-700 rounded animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : downloads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No downloads found
                </td>
              </tr>
            ) : (
              downloads.map((download) => (
                <tr key={download.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 max-w-[200px]">
                    <UserCell d={download} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-white text-sm">
                      <ImageIcon size={14} className="text-purple-400 shrink-0" aria-hidden="true" />
                      <span className="truncate max-w-[200px]">{download.sticker.title}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-300 text-sm">{download.sticker.collection.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={download.downloadType === 'single' ? 'info' : 'success'} size="sm">
                      {download.downloadType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm whitespace-nowrap">
                    {formatDateTime(download.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-t border-slate-700">
          <p className="text-xs sm:text-sm text-slate-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft size={16} />
              <span className="hidden xs:inline">Previous</span>
            </Button>
            <span className="text-xs sm:text-sm text-slate-400 whitespace-nowrap">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
