'use client'

import { useState, useEffect } from 'react'
import { Download, Users, Image, FolderOpen, FileDown, RefreshCw, Search } from 'lucide-react'
import { StatsCard, DownloadsChart, DownloadsTable } from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { formatNumber } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Metrics {
  overview: {
    totalDownloads: number
    downloadsInPeriod: number
    uniqueUsers: number
    anonymousDownloads: number
    totalVisits: number
    totalCollections: number
    totalStickers: number
  }
  collectionStats: { name: string; downloads: number }[]
  topStickers: { sticker: { id: string; title: string }; downloads: number }[]
  downloadsOverTime: { date: string; count: number }[]
}

interface DownloadRecord {
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

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [downloads, setDownloads] = useState<DownloadRecord[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [, setIsLoadingMetrics] = useState(true)
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(true)
  const [isExporting, setIsExporting] = useState(false)

  const fetchMetrics = async () => {
    setIsLoadingMetrics(true)
    try {
      const res = await fetch('/api/admin/metrics')
      const data = await res.json()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      toast.error('Failed to load metrics')
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const fetchDownloads = async (page = 1, search = '') => {
    setIsLoadingDownloads(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
      })
      const res = await fetch(`/api/admin/downloads?${params}`)
      const data = await res.json()
      setDownloads(data.downloads)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch downloads:', error)
      toast.error('Failed to load downloads')
    } finally {
      setIsLoadingDownloads(false)
    }
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const res = await fetch('/api/admin/downloads?format=csv')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `downloads-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('CSV exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export CSV')
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    fetchDownloads()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDownloads(1, searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-slate-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Monitor downloads and user engagement</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchMetrics}>
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCSV}
              isLoading={isExporting}
            >
              <FileDown size={16} className="mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Downloads"
            value={metrics ? formatNumber(metrics.overview.totalDownloads) : '-'}
            icon={Download}
          />
          <StatsCard
            title="Unique Users"
            value={metrics ? formatNumber(metrics.overview.uniqueUsers) : '-'}
            description="Email + Phone registrations"
            icon={Users}
          />
          <StatsCard
            title="Total Stickers"
            value={metrics ? metrics.overview.totalStickers : '-'}
            icon={Image}
          />
          <StatsCard
            title="Collections"
            value={metrics ? metrics.overview.totalCollections : '-'}
            icon={FolderOpen}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Downloads Over Time */}
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Downloads Over Time</h3>
            {metrics && <DownloadsChart data={metrics.downloadsOverTime} />}
          </div>

          {/* Top Stickers */}
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Top Stickers</h3>
            <div className="space-y-3">
              {metrics?.topStickers.slice(0, 5).map((item, index) => (
                <div
                  key={item.sticker?.id || index}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-white truncate max-w-[150px]">
                      {item.sticker?.title || 'Unknown'}
                    </span>
                  </div>
                  <span className="text-sm text-slate-400">{item.downloads}</span>
                </div>
              ))}
              {(!metrics || metrics.topStickers.length === 0) && (
                <p className="text-slate-400 text-sm">No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Collection Stats */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Downloads by Collection</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {metrics?.collectionStats.map((stat) => (
              <div
                key={stat.name}
                className="bg-slate-700/50 rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-white mb-1">{stat.downloads}</p>
                <p className="text-xs text-slate-400 line-clamp-2">{stat.name}</p>
              </div>
            ))}
            {(!metrics || metrics.collectionStats.length === 0) && (
              <p className="text-slate-400 text-sm col-span-full">No data available</p>
            )}
          </div>
        </div>

        {/* Downloads Table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Downloads</h3>
            <div className="w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by email, phone, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <DownloadsTable
            downloads={downloads}
            pagination={pagination}
            onPageChange={(page) => fetchDownloads(page, searchQuery)}
            isLoading={isLoadingDownloads}
          />
        </div>
      </div>
    </div>
  )
}
