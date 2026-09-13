import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  className?: string
  render: (row: T, index: number) => React.ReactNode
}

export interface PaginationOptions {
  total: number
  page: number
  limit: number
  totalPages: number
  onPageChange: (page: number) => void
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: (row: T) => string
  pagination?: PaginationOptions
  onSearch?: (query: string) => void
  loading?: boolean
}

export function Table<T>({ columns, data, rowKey, pagination, onSearch, loading }: Props<T>) {
  const [query, setQuery] = useState('')
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return }
    const t = setTimeout(() => onSearch?.(query), 300)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div className="flex flex-col gap-2">
      {onSearch && (
        <div className="flex justify-end">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-52"
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-brand-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-200 ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-400">
                  Loading…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-400">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={rowKey(row)} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-gray-900 ${col.className ?? ''}`}>
                      {col.render(row, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pagination && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
            <span className="text-xs text-gray-400">{pagination.total} records</span>
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
    </div>
  )
}
