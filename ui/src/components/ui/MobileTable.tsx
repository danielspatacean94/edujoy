import { useState, ReactNode } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationOptions } from './Table'

interface Props<T> {
  data: T[]
  rowKey: (row: T) => string
  renderContent: (row: T, index: number) => ReactNode
  renderActions?: (row: T, index: number) => ReactNode
  getSearchText?: (row: T) => string
  pagination?: PaginationOptions
}

export function MobileTable<T>({ data, rowKey, renderContent, renderActions, getSearchText, pagination }: Props<T>) {
  const [query, setQuery] = useState('')

  const filtered = query
    ? data.filter((row) => {
        const text = getSearchText ? getSearchText(row) : JSON.stringify(row)
        return text.toLowerCase().includes(query.toLowerCase())
      })
    : data

  return (
    <div className="flex flex-col gap-2">
      {getSearchText && (
        <div className="flex justify-end">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută..."
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-52"
            />
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Nu există înregistrări.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((row, idx) => (
            <div key={rowKey(row)} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">{renderContent(row, idx)}</div>
                {renderActions && <div className="shrink-0">{renderActions(row, idx)}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && (
        <div className="flex items-center justify-between px-1 py-1">
          <span className="text-xs text-gray-400">{pagination.total} înregistrări</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs text-gray-500 tabular-nums px-1">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
