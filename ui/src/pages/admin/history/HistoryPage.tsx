import { useEffect, useState } from 'react'
import { Eye, X } from 'lucide-react'
import { Table, type Column } from '@/components/ui/Table'
import { MobileTable } from '@/components/ui/MobileTable'
import { AuditLog, AuditLogFilters, HISTORY_LIMIT, useHistoryStore } from './useHistoryStore'

const ACTION_LABEL: Record<AuditLog['action'], string> = {
  INSERT: 'Created',
  UPDATE: 'Updated',
  SOFT_DELETE: 'Deleted',
}

const ACTION_CLASS: Record<AuditLog['action'], string> = {
  INSERT: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  SOFT_DELETE: 'bg-red-100 text-red-700',
}

// Add a label here for every entity name that should read nicer than its raw
// class name (e.g. once a `Client` entity exists, add `Client: 'Client'`).
const ENTITY_TYPE_LABEL: Record<string, string> = {
  User: 'User',
  Settings: 'Settings',
}

const ACTIONS: AuditLog['action'][] = ['INSERT', 'UPDATE', 'SOFT_DELETE']

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function serializeValue(val: unknown): string {
  if (val === null || val === undefined) return 'null'
  if (typeof val === 'string') return val
  return JSON.stringify(val)
}

function DiffTable({ before, after }: {
  before: Record<string, any> | null
  after: Record<string, any> | null
}) {
  const allKeys = [...new Set([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ])]

  const changedKeys = new Set(
    allKeys.filter((k) => JSON.stringify((before ?? {})[k] ?? null) !== JSON.stringify((after ?? {})[k] ?? null))
  )

  const sortedKeys = [
    ...allKeys.filter((k) => changedKeys.has(k)),
    ...allKeys.filter((k) => !changedKeys.has(k)),
  ]

  return (
    <div className="overflow-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs font-mono border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-3 py-2 text-gray-500 font-semibold whitespace-nowrap w-px">Field</th>
            <th className="text-left px-3 py-2 text-gray-500 font-semibold w-1/2">Before</th>
            <th className="text-left px-3 py-2 text-gray-500 font-semibold w-1/2">After</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedKeys.map((key) => {
            const isChanged = changedKeys.has(key)
            const beforeStr = serializeValue((before ?? {})[key])
            const afterStr = serializeValue((after ?? {})[key])
            return (
              <tr key={key} className={isChanged ? 'bg-white' : 'opacity-35'}>
                <td className={`px-3 py-1.5 align-top whitespace-nowrap ${isChanged ? 'text-gray-800 font-bold' : 'text-gray-400'}`}>
                  {key}
                </td>
                <td className={`px-3 py-1.5 align-top break-all ${isChanged ? 'text-red-700 bg-red-50' : 'text-gray-400'}`}>
                  {beforeStr}
                </td>
                <td className={`px-3 py-1.5 align-top break-all ${isChanged ? 'text-green-700 bg-green-50' : 'text-gray-400'}`}>
                  {afterStr}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function EntityTable({ data, valueClass }: {
  data: Record<string, any> | null
  valueClass: string
}) {
  return (
    <div className="overflow-auto rounded-lg border border-gray-200">
      <table className="w-full text-xs font-mono border-collapse">
        <tbody className="divide-y divide-gray-100">
          {Object.entries(data ?? {}).map(([key, val]) => (
            <tr key={key}>
              <td className="px-3 py-1.5 text-gray-700 font-bold whitespace-nowrap w-px align-top">{key}</td>
              <td className={`px-3 py-1.5 align-top break-all ${valueClass}`}>{serializeValue(val)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DetailModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900">Change details</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {ENTITY_TYPE_LABEL[log.entityType] ?? log.entityType}
              {log.entityId && <> · <span className="font-mono">{log.entityId}</span></>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {log.action === 'INSERT' && (
            <EntityTable data={log.entityAfter} valueClass="text-green-700 bg-green-50" />
          )}
          {log.action === 'UPDATE' && (
            <DiffTable before={log.entityBefore} after={log.entityAfter} />
          )}
          {log.action === 'SOFT_DELETE' && (
            <EntityTable data={log.entityBefore} valueClass="text-red-700 bg-red-50" />
          )}
        </div>
      </div>
    </div>
  )
}

export function HistoryPage() {
  const { logs, total, loading, fetchLogs } = useHistoryStore()
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<AuditLogFilters>({})
  const [detail, setDetail] = useState<AuditLog | null>(null)

  useEffect(() => {
    fetchLogs(page, filters)
  }, [page, filters])

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }))
    setPage(1)
  }

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query || undefined }))
    setPage(1)
  }

  const columns: Column<AuditLog>[] = [
    {
      key: 'createdAt',
      header: 'Date / time',
      className: 'whitespace-nowrap w-40',
      render: (log) => (
        <span className="text-xs text-gray-500 tabular-nums">{formatDate(log.createdAt)}</span>
      ),
    },
    {
      key: 'user',
      header: 'User',
      render: (log) =>
        log.userFullName || log.userEmail
          ? (
            <div>
              {log.userFullName && <p className="text-sm font-medium text-gray-900">{log.userFullName}</p>}
              {log.userEmail && <p className="text-xs text-gray-400">{log.userEmail}</p>}
            </div>
          )
          : <span className="text-gray-400 text-xs">—</span>,
    },
    {
      key: 'action',
      header: 'Action',
      className: 'w-32',
      render: (log) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_CLASS[log.action]}`}>
          {ACTION_LABEL[log.action]}
        </span>
      ),
    },
    {
      key: 'entityType',
      header: 'Entity',
      className: 'w-40',
      render: (log) => (
        <span className="text-sm text-gray-700">
          {ENTITY_TYPE_LABEL[log.entityType] ?? log.entityType}
        </span>
      ),
    },
    {
      key: 'entityId',
      header: 'ID',
      render: (log) => (
        <span className="font-mono text-xs text-gray-400 truncate block max-w-[220px]" title={log.entityId ?? ''}>
          {log.entityId ?? '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      render: (log) => (
        <div className="flex justify-end">
          <button
            onClick={() => setDetail(log)}
            title="Details"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ]

  const totalPages = Math.ceil(total / HISTORY_LIMIT)

  return (
    <>
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <p className="text-base text-gray-500">All changes made across the platform.</p>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filters.action ?? ''}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700"
            >
              <option value="">All actions</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>{ACTION_LABEL[a]}</option>
              ))}
            </select>

            <input
              type="text"
              value={filters.entityType ?? ''}
              onChange={(e) => handleFilterChange('entityType', e.target.value)}
              placeholder="Entity type"
              className="text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-700 w-36"
            />
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <Table
            columns={columns}
            data={logs}
            rowKey={(log) => log._id}
            loading={loading}
            onSearch={handleSearch}
            pagination={
              total > 0
                ? { total, page, limit: HISTORY_LIMIT, totalPages, onPageChange: setPage }
                : undefined
            }
          />
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          <MobileTable
            data={logs}
            rowKey={(log) => log._id}
            pagination={
              total > 0
                ? { total, page, limit: HISTORY_LIMIT, totalPages, onPageChange: setPage }
                : undefined
            }
            renderContent={(log) => (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_CLASS[log.action]}`}>
                    {ACTION_LABEL[log.action]}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {ENTITY_TYPE_LABEL[log.entityType] ?? log.entityType}
                  </span>
                </div>
                {(log.userFullName || log.userEmail) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {log.userFullName ?? log.userEmail}
                    {log.userFullName && log.userEmail && (
                      <span className="text-gray-400"> · {log.userEmail}</span>
                    )}
                  </p>
                )}
                {log.entityId && (
                  <p className="font-mono text-[10px] text-gray-400 mt-0.5 truncate">{log.entityId}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1 tabular-nums">{formatDate(log.createdAt)}</p>
              </>
            )}
            renderActions={(log) => (
              <button
                onClick={() => setDetail(log)}
                title="Details"
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Eye size={15} />
              </button>
            )}
          />
        </div>
      </div>

      {detail && <DetailModal log={detail} onClose={() => setDetail(null)} />}
    </>
  )
}
