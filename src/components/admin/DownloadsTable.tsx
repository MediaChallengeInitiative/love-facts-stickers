'use client'

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

export function DownloadsTable({
  downloads,
  pagination,
  onPageChange,
  isLoading,
}: DownloadsTableProps) {
  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
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
              // Loading skeleton
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-slate-700 rounded animate-pulse w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-slate-700 rounded animate-pulse w-24" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-slate-700 rounded animate-pulse w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-slate-700 rounded animate-pulse w-16" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-4 bg-slate-700 rounded animate-pulse w-20" />
                  </td>
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
                  <td className="px-4 py-3">
                    {download.isAnonymous ? (
                      <span className="flex items-center gap-2 text-slate-400">
                        <User size={14} />
                        Anonymous
                      </span>
                    ) : (
                      <div className="space-y-1">
                        {download.userName && (
                          <p className="text-white text-sm">{download.userName}</p>
                        )}
                        {download.userEmail && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Mail size={12} />
                            {download.userEmail}
                          </span>
                        )}
                        {download.userPhone && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Phone size={12} />
                            {download.userPhone}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 text-white text-sm">
                      <ImageIcon size={14} className="text-purple-400" aria-hidden="true" />
                      {download.sticker.title}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-300 text-sm">
                      {download.sticker.collection.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={download.downloadType === 'single' ? 'info' : 'success'}
                      size="sm"
                    >
                      {download.downloadType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <span className="text-sm text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
